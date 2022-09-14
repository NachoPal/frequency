//! Autogenerated weights for orml_vesting
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-09-14, STEPS: `50`, REPEAT: 10, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("./scripts/../res/genesis/testnet/frequency-spec-rococo-testnet.json"), DB CACHE: 1024

// Executed Command:
// ./scripts/../target/release/frequency
// benchmark
// pallet
// --pallet
// orml_vesting
// --extrinsic
// *
// --chain=./scripts/../res/genesis/testnet/frequency-spec-rococo-testnet.json
// --execution
// wasm
// --wasm-execution
// compiled
// --steps
// 50
// --repeat
// 10
// --output=./scripts/../runtime/common/src/weights/orml_vesting.rs
// --template=./scripts/../.maintain/runtime-weight-template.hbs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

/// Weights for orml_vesting using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> orml_vesting::WeightInfo for SubstrateWeight<T> {
	// Storage: ParachainSystem ValidationData (r:1 w:0)
	// Storage: Vesting VestingSchedules (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	// Storage: Balances Locks (r:1 w:1)
	fn vested_transfer() -> Weight {
		(74_923_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: ParachainSystem ValidationData (r:1 w:0)
	// Storage: Vesting VestingSchedules (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	/// The range of component `i` is `[1, 50]`.
	fn claim(i: u32, ) -> Weight {
		(39_762_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((150_000 as Weight).saturating_mul(i as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: System Account (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: Vesting VestingSchedules (r:0 w:1)
	/// The range of component `i` is `[1, 50]`.
	fn update_vesting_schedules(i: u32, ) -> Weight {
		(38_345_000 as Weight)
			// Standard Error: 8_000
			.saturating_add((93_000 as Weight).saturating_mul(i as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
}
