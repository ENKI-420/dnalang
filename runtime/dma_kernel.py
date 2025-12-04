"""
DNA Molecular Automata (DMA) Kernel

Core operations for executing DMA computations:
E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±

Implements:
- Temporal gradient computation
- Decoherence measurement
- Duality operator application
- Emergence calculation
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Callable
import math


# Constants
THETA_CRITICAL = 51.843  # Critical torsion angle
DET_CRITICAL = 0.61803398875  # 1/φ (golden ratio inverse)
OMEGA_SOV_THRESHOLD = 0.97  # Sovereignty threshold
EMERGENCE_THRESHOLD = 7.0  # Ξ threshold
GAMMA_TOLERANCE = 1e-9  # Decoherence tolerance


@dataclass
class CRSM7State:
    """7-dimensional CRSM State Vector
    
    C(t) = {Λ(t), Γ(t), Φ(t), Ξ(t), ρ_polarity, θ, τ}
    """
    lambda_: float = 0.869  # Λ - coherence
    gamma: float = 0.012    # Γ - decoherence
    phi: float = 7.6901     # Φ - information
    xi: float = 0.0         # Ξ - emergence (computed)
    rho_polarity: float = 1.0  # ρ± - polarity
    theta: float = THETA_CRITICAL  # θ - torsion
    tau: float = 0.0        # τ - epoch
    
    def __post_init__(self):
        self.compute_emergence()
    
    def compute_emergence(self) -> float:
        """Compute Ξ = ΛΦ/Γ"""
        if self.gamma > GAMMA_TOLERANCE:
            self.xi = (self.lambda_ * self.phi) / self.gamma
        else:
            # When Γ → 0, cap emergence at a large finite value for numerical stability
            self.xi = 1e12
        return self.xi
    
    def as_tuple(self) -> Tuple[float, ...]:
        """Return state as tuple"""
        return (self.lambda_, self.gamma, self.phi, self.xi,
                self.rho_polarity, self.theta, self.tau)


@dataclass
class Gene:
    """Gene vertex in Z3 mesh"""
    id: str
    name: str
    state: CRSM7State = field(default_factory=CRSM7State)
    bound: bool = False


class DualityOperator:
    """Duality-Polarized Bifurcation Operator
    
    Π±_dual = ½(1 ± J)
    Where J is the polarity involution: J² = 1, JΨ = -Ψ
    """
    
    def __init__(self):
        self.rank = 1
    
    def j_involution(self, psi: float) -> float:
        """J involution: J(Ψ) = -Ψ"""
        return -psi
    
    def verify_involution(self, psi: float) -> bool:
        """Verify J² = 1"""
        j_psi = self.j_involution(psi)
        j_j_psi = self.j_involution(j_psi)
        return abs(j_j_psi - psi) < 1e-10
    
    def pi_plus(self, psi: float) -> float:
        """Π+_dual = ½(1 + J)"""
        return 0.5 * (psi + self.j_involution(psi))
    
    def pi_minus(self, psi: float) -> float:
        """Π-_dual = ½(1 - J)"""
        return 0.5 * (psi - self.j_involution(psi))
    
    def bifurcate(self, psi: float) -> Tuple[float, float]:
        """B(Ψ) = (Π+Ψ, Π-Ψ)"""
        return (self.pi_plus(psi), self.pi_minus(psi))
    
    def apply(self, psi: float, polarity: float) -> float:
        """Apply duality based on polarity"""
        if polarity >= 0:
            return self.pi_plus(psi)
        return self.pi_minus(psi)


def compute_temporal_gradient(gene: Gene, dt: float = 0.01) -> float:
    """Compute ∂g/∂τ - temporal gradient of gene state
    
    Approximates the rate of change of the gene's coherence
    """
    state = gene.state
    alpha = 0.1
    det_factor = DET_CRITICAL ** (-0.5)
    
    # Gradient based on current state
    gradient = alpha * det_factor * state.lambda_
    return gradient


def compute_decoherence(gene: Gene) -> float:
    """Compute Γ(g) - decoherence of gene
    
    Returns the current decoherence value
    """
    return gene.state.gamma


def apply_duality(gene: Gene) -> float:
    """Apply duality operator Π± to gene
    
    Returns the duality-projected value
    """
    duality = DualityOperator()
    return duality.apply(gene.state.lambda_, gene.state.rho_polarity)


def compute_dma_operator(gene: Gene) -> float:
    """Compute the DMA operator for a single gene
    
    (∂g/∂τ - Γ(g)) ⊗ Π±
    """
    gradient = compute_temporal_gradient(gene)
    gamma = compute_decoherence(gene)
    duality_factor = apply_duality(gene)
    
    return (gradient - gamma) * duality_factor


class DMKernel:
    """DMA Execution Kernel
    
    Implements E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±
    """
    
    def __init__(self):
        self.duality = DualityOperator()
    
    def execute(self, genes: List[Gene]) -> float:
        """Execute DMA over a collection of genes
        
        E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±
        """
        total = 0.0
        for gene in genes:
            result = compute_dma_operator(gene)
            total += result
        return total
    
    def execute_generator(self, genes: List[Gene]):
        """Generator version - yields individual gene results"""
        for gene in genes:
            gradient = compute_temporal_gradient(gene)
            gamma = compute_decoherence(gene)
            result = (gradient - gamma) * apply_duality(gene)
            yield result
    
    def check_emergence(self, genes: List[Gene]) -> bool:
        """Check if emergence criterion is met: Ξ = ΛΦ/Γ > 7.0"""
        for gene in genes:
            gene.state.compute_emergence()
            if gene.state.xi < EMERGENCE_THRESHOLD:
                return False
        return True


def evolve_state(state: CRSM7State, dt: float = 1.0) -> CRSM7State:
    """Evolve CRSM7 state by time step dt
    
    ∂τΨ = α · det(g_A)^(-1/2) Ψ - ∇W²
    """
    alpha = 0.1
    det_factor = DET_CRITICAL ** (-0.5)
    
    # Update coherence (tends to increase)
    new_lambda = state.lambda_ + alpha * det_factor * state.lambda_ * dt
    new_lambda = min(new_lambda, 0.999)
    
    # Update decoherence (tends to decrease)
    new_gamma = state.gamma * math.exp(-alpha * dt)
    new_gamma = max(new_gamma, GAMMA_TOLERANCE)
    
    # Update information (accumulates)
    new_phi = state.phi + 0.01 * state.lambda_ * dt
    
    # Update epoch
    new_tau = state.tau + dt
    
    return CRSM7State(
        lambda_=new_lambda,
        gamma=new_gamma,
        phi=new_phi,
        xi=0.0,  # Will be computed
        rho_polarity=state.rho_polarity,
        theta=state.theta,
        tau=new_tau
    )


if __name__ == "__main__":
    # Test the DMA kernel
    kernel = DMKernel()
    
    # Create test genes
    genes = [
        Gene("g1", "AURA", CRSM7State(0.89, 0.001, 8.1, 0, 1.0, THETA_CRITICAL, 0)),
        Gene("g2", "AIDEN", CRSM7State(0.87, 0.002, 7.9, 0, 1.0, THETA_CRITICAL, 0)),
        Gene("g3", "CCCcE", CRSM7State(0.88, 0.001, 8.0, 0, 1.0, THETA_CRITICAL, 0)),
    ]
    
    # Execute DMA
    result = kernel.execute(genes)
    print(f"E_DMA(O) = {result:.6f}")
    
    # Check emergence
    if kernel.check_emergence(genes):
        print("Emergence criterion met: Ξ ≥ 7.0")
    else:
        print("Emergence criterion not met")
