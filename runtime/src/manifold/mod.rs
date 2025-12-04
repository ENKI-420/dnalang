//! Manifold Module
//!
//! 7-dimensional manifold implementations for CRSM

pub mod crsm7;

pub use crsm7::{
    CRSM7State, DET_CRITICAL, EMERGENCE_MAX, EMERGENCE_THRESHOLD, GAMMA_TOLERANCE,
    OMEGA_SOV_THRESHOLD, THETA_CRITICAL,
};
