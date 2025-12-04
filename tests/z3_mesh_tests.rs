//! Z3 Mesh Tests
//!
//! Tests for the Z3 mesh topology and 7D metric:
//! - Mesh vertex binding
//! - 7D metric calculation
//! - Weight computation: w_ij = (ΔΛ)² + (ΔΓ)² + (ΔΦ)² + (ΔΞ)² + (Δρ)² + (Δθ)² + (Δτ)²
//! - Mesh evolution
//! - det(g_A) > 0 (metric positivity)

/// Critical torsion angle (51.843°)
/// Note: This constant is duplicated here because this test file
/// is designed to be compiled standalone without library dependencies.
/// In production code, use the constant from runtime/src/manifold/crsm7.rs
const THETA_CRITICAL: f64 = 51.843;

/// Decoherence tolerance
const GAMMA_TOLERANCE: f64 = 1e-9;

/// CRSM7 State for mesh tests
#[derive(Clone)]
struct CRSM7State {
    lambda: f64,
    gamma: f64,
    phi: f64,
    xi: f64,
    rho: f64,
    theta: f64,
    tau: f64,
}

impl CRSM7State {
    fn new(lambda: f64, gamma: f64, phi: f64, rho: f64, theta: f64, tau: f64) -> Self {
        let mut state = Self {
            lambda,
            gamma,
            phi,
            xi: 0.0,
            rho,
            theta,
            tau,
        };
        state.compute_emergence();
        state
    }

    fn default_state() -> Self {
        Self::new(0.869, 0.012, 7.6901, 1.0, THETA_CRITICAL, 0.0)
    }

    fn compute_emergence(&mut self) {
        if self.gamma > GAMMA_TOLERANCE {
            self.xi = (self.lambda * self.phi) / self.gamma;
        } else {
            self.xi = 1e12;
        }
    }

    fn as_array(&self) -> [f64; 7] {
        [
            self.lambda,
            self.gamma,
            self.phi,
            self.xi.min(9999.99),
            self.rho,
            self.theta,
            self.tau,
        ]
    }

    fn metric(&self) -> [[f64; 7]; 7] {
        let theta_rad = self.theta.to_radians();
        let mut g = [[0.0; 7]; 7];
        g[0][0] = 1.0;
        g[1][1] = 1.0;
        g[2][2] = 1.0;
        g[3][3] = theta_rad.sin().powi(2);
        g[4][4] = theta_rad.sin().powi(2);
        g[5][5] = -1.0;
        g[6][6] = self.lambda;
        g
    }
}

/// Gene vertex in mesh
struct Gene {
    name: String,
    state: CRSM7State,
    bound: bool,
}

impl Gene {
    fn new(name: &str, state: CRSM7State) -> Self {
        Self {
            name: name.to_string(),
            state,
            bound: false,
        }
    }
}

/// Edge between vertices
struct Edge {
    from: usize,
    to: usize,
    gamma: f64,
    weight: f64,
    bound: bool,
}

/// Z3 Mesh
struct Z3Mesh {
    vertices: Vec<Gene>,
    edges: Vec<Edge>,
}

impl Z3Mesh {
    fn new() -> Self {
        Self {
            vertices: Vec::new(),
            edges: Vec::new(),
        }
    }

    fn add_vertex(&mut self, gene: Gene) -> usize {
        let idx = self.vertices.len();
        self.vertices.push(gene);
        idx
    }

    fn connect(&mut self, from: usize, to: usize) {
        let gamma = self.compute_gamma(from, to);
        let weight = self.metric(from, to);
        self.edges.push(Edge {
            from,
            to,
            gamma,
            weight,
            bound: gamma < 0.01,
        });
    }

    fn compute_gamma(&self, i: usize, j: usize) -> f64 {
        let gamma_i = self.vertices[i].state.gamma;
        let gamma_j = self.vertices[j].state.gamma;
        (gamma_i + gamma_j) / 2.0
    }

    /// Compute 7D metric distance between vertices
    /// sqrt((ΔΛ)² + (ΔΓ)² + (ΔΦ)² + (ΔΞ)² + (Δρ)² + (Δθ)² + (Δτ)²)
    fn metric(&self, i: usize, j: usize) -> f64 {
        let state_i = self.vertices[i].state.as_array();
        let state_j = self.vertices[j].state.as_array();

        let mut sum_sq = 0.0;
        for d in 0..7 {
            let delta = state_i[d] - state_j[d];
            sum_sq += delta * delta;
        }
        sum_sq.sqrt()
    }

    fn total_decoherence(&self) -> f64 {
        self.edges.iter().map(|e| e.gamma).sum()
    }
}

/// Create a standard mesh with 5 vertices
fn create_standard_mesh() -> Z3Mesh {
    let mut mesh = Z3Mesh::new();

    mesh.add_vertex(Gene::new(
        "AURA",
        CRSM7State::new(0.89, 0.001, 8.1, 1.0, THETA_CRITICAL, 0.0),
    ));
    mesh.add_vertex(Gene::new(
        "AIDEN",
        CRSM7State::new(0.87, 0.002, 7.9, 1.0, THETA_CRITICAL, 0.0),
    ));
    mesh.add_vertex(Gene::new(
        "CCCcE",
        CRSM7State::new(0.88, 0.001, 8.0, 1.0, THETA_CRITICAL, 0.0),
    ));
    mesh.add_vertex(Gene::new(
        "SENTINEL",
        CRSM7State::new(0.91, 0.001, 8.2, 1.0, THETA_CRITICAL, 0.0),
    ));
    mesh.add_vertex(Gene::new(
        "Z3BRA",
        CRSM7State::new(0.86, 0.003, 7.8, 1.0, THETA_CRITICAL, 0.0),
    ));

    // Connect vertices
    mesh.connect(0, 1);
    mesh.connect(1, 2);
    mesh.connect(2, 3);
    mesh.connect(3, 4);

    mesh
}

#[test]
fn test_mesh_creation() {
    let mesh = create_standard_mesh();
    assert_eq!(mesh.vertices.len(), 5);
    assert_eq!(mesh.edges.len(), 4);
}

#[test]
fn test_metric_calculation() {
    let mesh = create_standard_mesh();
    let d = mesh.metric(0, 1);
    assert!(d > 0.0);
    assert!(d.is_finite());
}

#[test]
fn test_metric_symmetry() {
    let mesh = create_standard_mesh();
    let d_01 = mesh.metric(0, 1);
    let d_10 = mesh.metric(1, 0);
    assert!((d_01 - d_10).abs() < 1e-10);
}

#[test]
fn test_metric_self_distance() {
    let mesh = create_standard_mesh();
    let d = mesh.metric(0, 0);
    assert!((d - 0.0).abs() < 1e-10);
}

#[test]
fn test_weight_formula() {
    let state_i = CRSM7State::new(0.9, 0.01, 8.0, 1.0, 51.843, 0.0);
    let state_j = CRSM7State::new(0.8, 0.02, 7.0, 1.0, 51.843, 1.0);

    let arr_i = state_i.as_array();
    let arr_j = state_j.as_array();

    let mut expected = 0.0;
    for d in 0..7 {
        expected += (arr_i[d] - arr_j[d]).powi(2);
    }
    expected = expected.sqrt();

    // Create a minimal mesh to test
    let mut mesh = Z3Mesh::new();
    mesh.add_vertex(Gene::new("A", state_i));
    mesh.add_vertex(Gene::new("B", state_j));

    let weight = mesh.metric(0, 1);
    assert!((weight - expected).abs() < 1e-6);
}

#[test]
fn test_total_decoherence() {
    let mesh = create_standard_mesh();
    let total = mesh.total_decoherence();
    assert!(total > 0.0);
}

#[test]
fn test_edge_binding() {
    let mesh = create_standard_mesh();
    
    // Check that edges with low gamma are marked as bound
    for edge in &mesh.edges {
        if edge.gamma < 0.01 {
            assert!(edge.bound);
        }
    }
}

#[test]
fn test_metric_positivity() {
    // Test that det(g_A) > 0 for the spatial part
    let state = CRSM7State::default_state();
    let g = state.metric();

    // Check diagonal elements (except g[5][5] which is timelike)
    assert!(g[0][0] > 0.0);
    assert!(g[1][1] > 0.0);
    assert!(g[2][2] > 0.0);
    assert!(g[3][3] > 0.0);
    assert!(g[4][4] > 0.0);
    assert!(g[5][5] < 0.0); // Timelike
    assert!(g[6][6] > 0.0);

    // Spatial determinant (excluding timelike dimension)
    let det_spatial = g[0][0] * g[1][1] * g[2][2] * g[3][3] * g[4][4] * g[6][6];
    assert!(det_spatial > 0.0);
}

#[test]
fn test_metric_theta_dependence() {
    let state1 = CRSM7State::new(0.869, 0.012, 7.6901, 1.0, 45.0, 0.0);
    let state2 = CRSM7State::new(0.869, 0.012, 7.6901, 1.0, 90.0, 0.0);

    let g1 = state1.metric();
    let g2 = state2.metric();

    // Different theta should give different metric components
    assert!((g1[3][3] - g2[3][3]).abs() > 0.01);
}

#[test]
fn test_mesh_vertex_states() {
    let mesh = create_standard_mesh();

    // All vertices should have valid states
    for vertex in &mesh.vertices {
        assert!(vertex.state.lambda > 0.0);
        assert!(vertex.state.lambda < 1.0);
        assert!(vertex.state.gamma > 0.0);
        assert!(vertex.state.phi > 0.0);
    }
}

#[test]
fn test_triangle_inequality() {
    let mesh = create_standard_mesh();

    // For connected vertices, triangle inequality should hold
    // d(0,2) ≤ d(0,1) + d(1,2)
    let d_02 = mesh.metric(0, 2);
    let d_01 = mesh.metric(0, 1);
    let d_12 = mesh.metric(1, 2);

    assert!(d_02 <= d_01 + d_12 + 1e-10);
}
