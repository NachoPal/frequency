window.SIDEBAR_ITEMS = {"constant":[["AVERAGE_ON_INITIALIZE_RATIO","We assume that ~5% of the block weight is consumed by `on_initialize` handlers. This is used to limit the maximal weight of a single extrinsic."],["DAYS",""],["EXISTENTIAL_DEPOSIT","The existential deposit. Set to 1/10 of the Connected Relay Chain."],["FREQUENCY_ROCOCO_TOKEN",""],["FREQUENCY_TOKEN",""],["HOURS",""],["MAXIMUM_BLOCK_WEIGHT","We allow for 0.5 of a second of compute with a 12 second average block time."],["MICROUNIT",""],["MILLISECS_PER_BLOCK","This daetermines the average expected block time that we are targeting. Blocks will be produced at a minimum duration defined by `SLOT_DURATION`. `SLOT_DURATION` is picked up by `pallet_timestamp` which is in turn picked up by `pallet_aura` to implement `fn slot_duration()`."],["MILLIUNIT",""],["MINUTES",""],["NORMAL_DISPATCH_RATIO","We allow `Normal` extrinsics to fill up the block up to 75%, the rest can be used by `Operational` extrinsics."],["ORML_MAX_VESTING_SCHEDULES",""],["SLOT_DURATION",""],["UNIT",""],["VERSION",""],["WASM_BINARY",""],["WASM_BINARY_BLOATY",""]],"enum":[["Call",""],["Event",""],["MultiAddress","A multi-format address wrapper for on-chain accounts."],["OriginCaller",""]],"fn":[["native_version","The version information used to identify this runtime when compiled natively."]],"mod":[["api",""],["opaque","Opaque types. These are used by the CLI to instantiate machinery that don’t need to know the specifics of the runtime. They can then be made to be agnostic over specific formats of data like extrinsics, allowing for them to continue syncing the network through upgrades to even the core data structures."],["weights","Expose the auto generated weight files."],["xcm_config",""]],"struct":[["BlockExecutionWeight","Importing a block with 0 Extrinsics."],["CollatorPotId",""],["CooloffPeriod",""],["CouncilMotionDuration",""],["EnactmentPeriod",""],["ExistentialDeposit",""],["ExtrinsicBaseWeight","Executing a NO-OP `System::remarks` Extrinsic."],["FastTrackVotingPeriod",""],["GenesisConfig",""],["LaunchPeriod",""],["MaxDataSize","Clone + Debug + Eq  implementation for u32 types"],["MaxVestingSchedules","Need this declaration method for use + type safety in benchmarks"],["MaximumSchedulerWeight",""],["MessagesMaxPayloadSizeBytes",""],["MinVestedTransfer",""],["MinimumDeposit",""],["MinimumPeriod",""],["NoPreimagePostponement",""],["Origin","The runtime origin type representing the origin of a call."],["PalletInfo","Provides an implementation of `PalletInfo` to provide information about the pallet setup in the runtime."],["Perbill","A fixed point representation of a number in the range [0, 1]."],["Permill","A fixed point representation of a number in the range [0, 1]."],["PreimageBaseDeposit",""],["PreimageByteDeposit",""],["ReservedDmpWeight",""],["ReservedXcmpWeight",""],["RootAsVestingPallet",""],["Runtime",""],["RuntimeApi",""],["RuntimeApiImpl","Implements all runtime apis for the client side."],["RuntimeBlockLength",""],["RuntimeBlockWeights",""],["SS58Prefix",""],["SchemasMaxRegistrations",""],["SessionKeys",""],["TCMotionDuration",""],["TransactionByteFee","Relay Chain `TransactionByteFee` / 10"],["Version",""],["VestingPalletId",""],["VotingPeriod",""],["WeightToFee","Handles converting a weight scalar to a fee value, based on the scale and granularity of the node’s balance type."]],"trait":[["BuildStorage","Complex storage builder stuff."]],"type":[["AllPallets","All pallets included in the runtime as a nested tuple of types."],["AllPalletsReversedWithSystemFirst","All pallets included in the runtime as a nested tuple of types in reversed order. With the system pallet first."],["AllPalletsWithSystem","All pallets included in the runtime as a nested tuple of types."],["AllPalletsWithSystemReversed","All pallets included in the runtime as a nested tuple of types in reversed order."],["AllPalletsWithoutSystem","All pallets included in the runtime as a nested tuple of types. Excludes the System pallet."],["AllPalletsWithoutSystemReversed","All pallets included in the runtime as a nested tuple of types in reversed order. Excludes the System pallet."],["Aura",""],["AuraConfig",""],["AuraExt",""],["AuraExtConfig",""],["AuraId","An Aura authority identifier using S/R 25519 as its crypto."],["AuraMaxAuthorities",""],["Authorship",""],["AuthorshipUncleGenerations",""],["Balances",""],["BalancesConfig",""],["BalancesMaxLocks",""],["BalancesMaxReserves",""],["Block","Block type as expected by this runtime."],["BlockId","BlockId type as expected by this runtime."],["CheckedExtrinsic","Extrinsic type that has already been checked."],["CollatorMaxCandidates",""],["CollatorMinCandidates",""],["CollatorSelection",""],["CollatorSelectionConfig",""],["CollatorSelectionUpdateOrigin",""],["Council",""],["CouncilConfig",""],["CouncilMaxProposals",""],["CumulusXcm",""],["Democracy",""],["DemocracyConfig",""],["DemocracyMaxProposals",""],["DemocracyMaxVotes",""],["DmpQueue",""],["Executive","Executive: handles dispatch to the various modules."],["FIFTY",""],["FrameSystemMaxConsumers",""],["Messages",""],["MessagesMaxPerBlock",""],["Msa",""],["MsaMaxKeys",""],["MsaMaxProviderNameSize",""],["ParachainInfo",""],["ParachainInfoConfig",""],["ParachainSystem",""],["ParachainSystemConfig",""],["PolkadotXcm",""],["PolkadotXcmConfig",""],["Preimage",""],["PreimageMaxSize",""],["Scheduler",""],["SchedulerMaxScheduledPerBlock",""],["Schemas",""],["SchemasConfig",""],["SchemasMaxBytesBoundedVecLimit",""],["SchemasMinModelSizeBytes",""],["Session",""],["SessionConfig",""],["SessionOffset",""],["SessionPeriod",""],["SignedBlock","A Block signed with a Justification"],["SignedExtra","The SignedExtension to the basic transaction logic."],["Sudo",""],["SudoConfig",""],["System",""],["SystemConfig",""],["TCMaxMembers",""],["TCMaxProposals",""],["TechnicalCommittee",""],["TechnicalCommitteeConfig",""],["Timestamp",""],["TransactionPayment",""],["TransactionPaymentOperationalFeeMultiplier",""],["UncheckedExtrinsic",""],["Utility",""],["Vesting",""],["VestingConfig",""],["XcmpQueue",""],["ZERO",""]]};