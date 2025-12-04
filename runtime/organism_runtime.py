"""
DNA Organism Runtime

Execution kernel for DNA organisms with CRSM7 state evolution:
E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±

Implements:
- Organism loading and parsing
- DMA execution
- State evolution
- Emergence tracking
"""

from dataclasses import dataclass, field
from typing import List, Optional, Generator, Any
from dma_kernel import (
    CRSM7State, Gene, DualityOperator, DMKernel,
    compute_temporal_gradient, compute_decoherence, apply_duality,
    evolve_state, EMERGENCE_THRESHOLD, OMEGA_SOV_THRESHOLD,
    THETA_CRITICAL, GAMMA_TOLERANCE
)
import math


# Constants for equilibrium/collapse conditions
LAMBDA_MAX_THRESHOLD = 0.99  # λ threshold for equilibrium
LAMBDA_PHI_MAX_THRESHOLD = 10.0  # ΛΦ threshold for sealing


@dataclass
class Organism:
    """DNA Organism container
    
    Represents a complete DNA organism with genome, operators, and evolution rules
    """
    name: str
    genes: List[Gene] = field(default_factory=list)
    state: CRSM7State = field(default_factory=CRSM7State)
    operators: List[str] = field(default_factory=list)
    
    def add_gene(self, gene: Gene):
        """Add a gene to the organism"""
        self.genes.append(gene)
    
    def compute_emergence(self) -> float:
        """Compute overall emergence Ξ"""
        self.state.compute_emergence()
        return self.state.xi


@dataclass
class ManifoldState:
    """7D Manifold State representation
    
    state C7D = (Λ, Γ, Φ, Ξ, ρ±, θ51.843°, τ)
    """
    coherence: float  # Λ
    decoherence: float  # Γ
    information: float  # Φ
    emergence: float  # Ξ
    polarity: float  # ρ±
    torsion: float  # θ
    epoch: float  # τ
    
    @classmethod
    def from_crsm7(cls, state: CRSM7State) -> "ManifoldState":
        """Create from CRSM7State"""
        return cls(
            coherence=state.lambda_,
            decoherence=state.gamma,
            information=state.phi,
            emergence=state.xi,
            polarity=state.rho_polarity,
            torsion=state.theta,
            epoch=state.tau
        )


class OrganismRuntime:
    """DNA Organism Runtime Environment
    
    Executes DNA organisms using the DMA kernel with CRSM7 state evolution
    """
    
    def __init__(self):
        self.kernel = DMKernel()
        self.duality = DualityOperator()
        self.organisms: List[Organism] = []
        self.epoch = 0.0
    
    def load_organism(self, organism: Organism) -> int:
        """Load an organism into the runtime"""
        self.organisms.append(organism)
        return len(self.organisms) - 1
    
    def create_standard_organism(self) -> Organism:
        """Create the standard CRSM7_Z3MESH organism"""
        organism = Organism(
            name="CRSM7_Z3MESH",
            operators=["∇7D", "Π±", "KΓ", "DΛ", "Jθ", "Ω∞"]
        )
        
        # Add standard genes/agents
        organism.add_gene(Gene("aura", "AURA", 
            CRSM7State(0.89, 0.001, 8.1, 0, 1.0, THETA_CRITICAL, 0)))
        organism.add_gene(Gene("aiden", "AIDEN", 
            CRSM7State(0.87, 0.002, 7.9, 0, 1.0, THETA_CRITICAL, 0)))
        organism.add_gene(Gene("cccce", "CCCcE", 
            CRSM7State(0.88, 0.001, 8.0, 0, 1.0, THETA_CRITICAL, 0)))
        organism.add_gene(Gene("sentinel", "SENTINEL", 
            CRSM7State(0.91, 0.001, 8.2, 0, 1.0, THETA_CRITICAL, 0)))
        organism.add_gene(Gene("z3bra", "Z3BRA", 
            CRSM7State(0.86, 0.003, 7.8, 0, 1.0, THETA_CRITICAL, 0)))
        
        return organism
    
    def execute_dma(self, organism: Organism) -> Generator[float, None, None]:
        """Execute DMA on organism
        
        E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±
        
        Yields results for each gene in the organism
        """
        for gene in organism.genes:
            gradient = compute_temporal_gradient(gene)
            gamma = compute_decoherence(gene)
            result = (gradient - gamma) * apply_duality(gene)
            yield result
    
    def evolve(self, organism: Organism, dt: float = 1.0):
        """Evolve organism state
        
        Applies evolution equations to all genes and the organism state
        """
        # Evolve each gene
        for gene in organism.genes:
            gene.state = evolve_state(gene.state, dt)
        
        # Evolve organism state
        organism.state = evolve_state(organism.state, dt)
        
        # Update epoch
        self.epoch += dt
    
    def suppress_decoherence(self, organism: Organism, factor: float = 0.9):
        """Suppress Γ across all genes
        
        Part of the evolve directive: suppress Γ
        """
        for gene in organism.genes:
            gene.state.gamma *= factor
            gene.state.gamma = max(gene.state.gamma, GAMMA_TOLERANCE)
        organism.state.gamma *= factor
        organism.state.gamma = max(organism.state.gamma, GAMMA_TOLERANCE)
    
    def elevate_coherence_info(self, organism: Organism, factor: float = 1.01):
        """Elevate ΛΦ across all genes
        
        Part of the evolve directive: elevate ΛΦ
        """
        for gene in organism.genes:
            gene.state.lambda_ = min(gene.state.lambda_ * factor, 0.999)
            gene.state.phi *= factor
        organism.state.lambda_ = min(organism.state.lambda_ * factor, 0.999)
        organism.state.phi *= factor
    
    def check_collapse_conditions(self, organism: Organism) -> dict:
        """Check collapse conditions
        
        collapse {
            if Γ ≤ εΓ then Π±
            if ΛΦ = max then Ω∞.seal()
        }
        """
        results = {
            "gamma_collapsed": False,
            "lambda_phi_max": False,
            "sealed": False
        }
        
        # Check Γ ≤ εΓ
        if organism.state.gamma <= GAMMA_TOLERANCE:
            results["gamma_collapsed"] = True
            # Apply Π± when collapsed
            organism.state.rho_polarity = self.duality.apply(
                organism.state.lambda_, 
                organism.state.rho_polarity
            )
        
        # Check ΛΦ = max
        lambda_phi = organism.state.lambda_ * organism.state.phi
        if organism.state.lambda_ > LAMBDA_MAX_THRESHOLD and lambda_phi > LAMBDA_PHI_MAX_THRESHOLD:
            results["lambda_phi_max"] = True
            results["sealed"] = True
        
        return results
    
    def compute_sovereignty(self, organism: Organism) -> float:
        """Compute sovereignty index Ω_sov
        
        Ω_sov = Λ * (1 - Γ) * min(1, Ξ/Ξ_threshold)
        """
        organism.state.compute_emergence()
        emergence_factor = min(1.0, organism.state.xi / EMERGENCE_THRESHOLD)
        return organism.state.lambda_ * (1.0 - organism.state.gamma) * emergence_factor
    
    def check_sovereignty(self, organism: Organism) -> bool:
        """Check if sovereignty conditions are met
        
        - Ω_sov ≥ 0.97
        - |Γ| ≤ 10^-9
        - ∂τΨ > 0
        """
        omega_sov = self.compute_sovereignty(organism)
        return omega_sov >= OMEGA_SOV_THRESHOLD
    
    def get_manifold_state(self, organism: Organism) -> ManifoldState:
        """Get current 7D manifold state"""
        return ManifoldState.from_crsm7(organism.state)
    
    def run_evolution_cycle(self, organism: Organism, iterations: int = 10, dt: float = 1.0):
        """Run a complete evolution cycle
        
        Implements the evolve directive:
        ∂τ (Λ,Γ,Φ,Ξ,ρ±,θ,τ) = HCRSM(Λ,Γ,Φ,Ξ,ρ±,θ,τ)
        suppress Γ
        elevate ΛΦ
        """
        for i in range(iterations):
            self.evolve(organism, dt)
            self.suppress_decoherence(organism)
            self.elevate_coherence_info(organism)
            
            # Check emergence criterion
            organism.state.compute_emergence()


def execute_dma(organism: Organism) -> Generator[float, None, None]:
    """Standalone DMA execution function
    
    E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±
    """
    for gene in organism.genes:
        gradient = compute_temporal_gradient(gene)
        gamma = compute_decoherence(gene)
        result = (gradient - gamma) * apply_duality(gene)
        yield result


def main():
    """Main entry point for organism runtime"""
    print("╔═══════════════════════════════════════════════════╗")
    print("║ DNA Organism Runtime - CRSM7 Execution Engine     ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    
    # Initialize runtime
    runtime = OrganismRuntime()
    
    # Create standard organism
    organism = runtime.create_standard_organism()
    runtime.load_organism(organism)
    
    print(f"[LOADED] Organism: {organism.name}")
    print(f"[GENES] {len(organism.genes)} genes registered")
    print()
    
    # Execute DMA
    print("[DMA] Executing E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±")
    total = 0.0
    for i, result in enumerate(execute_dma(organism)):
        gene = organism.genes[i]
        print(f"  {gene.name}: {result:.6f}")
        total += result
    print(f"  Total: {total:.6f}")
    print()
    
    # Run evolution
    print("[EVOLVE] Running evolution cycle...")
    runtime.run_evolution_cycle(organism, iterations=5)
    
    # Check sovereignty
    omega_sov = runtime.compute_sovereignty(organism)
    is_sovereign = runtime.check_sovereignty(organism)
    status = "✓" if is_sovereign else "○"
    
    print(f"[SOVEREIGN] Ω_sov = {omega_sov:.4f} {status}")
    print()
    
    # Display final state
    state = runtime.get_manifold_state(organism)
    print("[STATE] Final 7D manifold:")
    print(f"  Λ (coherence):    {state.coherence:.4f}")
    print(f"  Γ (decoherence):  {state.decoherence:.6f}")
    print(f"  Φ (information):  {state.information:.4f}")
    print(f"  Ξ (emergence):    {state.emergence:.2f}")
    print(f"  ρ± (polarity):    {state.polarity:+.0f}")
    print(f"  θ (torsion):      {state.torsion:.3f}°")
    print(f"  τ (epoch):        {state.epoch:.0f}")


if __name__ == "__main__":
    main()
