# Capacity Design Doc

## Context and Scope

Feeless transactions are essential in reaching mass adoption as it removes the overhead costs of transactions for app developers to acquire a far-reaching user base.

In this document, I will introduce the concept of [Capacity](https://forums.projectliberty.io/t/05-what-is-capacity-frequency-economics-part-1/248), a non-transferable resource that is associated with an MSA account of a [Registered Provider](https://github.com/LibertyDSNP/frequency/blob/main/designdocs/provider_registration.md),  and how Capacity can be acquired through staking, refills, and used to perform transactions such as:

- Create an MSA.
- Add a key to an MSA.
- Delegate permissions to another MSA.
- Update Delegate Permissions.
- Send a message.
- Send a batch message.

## Proposal

Frequency explains how Capacity can be acquired through staking, refills, and used to perform certain transactions.  This approach is addressed in each section below:

- [Implementation of how to acquire through staking](#staking)
- [Implementation of how to replenish Capacity](#replenish)
- [Prioritization of Capacity transactions](#priority)
- [Block space allocation for Capacity transactions](#block-space)
- [Implementation of using Capacity to perform transactions](#capacity-transactions)

 **Implementation of how to acquire through staking:** <a id='staking'></a>

This section is limited to the interfaces for staking and un-staking tokens.

As a Registered Provider, you can receive Capacity by staking your tokens to the network or when others stake their tokens to the network.

When staking tokens to the network, the network generates Capacity based on a Capacity-generating function that considers usage and other criteria. When you stake tokens, you will also provide a target Registered Provider to receive the Capacity generated. In exchange for staking Token to the network, you receive rewards.  Rewards are deferred to a supplemental [staking design doc](https://github.com/LibertyDSNP/frequency/issues/40). You may increase your stake to network many times and target different Service Providers each time you stake. Note every time you stake to network your tokens are locked until you decide to unstake.

Unstaking tokens allow you to schedule a number of tokens to be unlocked from your balance. The is no limit on the amount that you can schedule to be unlocked but there is a limit on how many scheduled requests you can make. After scheduling tokens to be unlocked you can receive those tokens after a thaw period has passed by calling the **`withdraw_unstaked`** extrinsic. If the call is successful the tokens become unlocked and increase the ability to make more scheduled requests.

Note that the thaw period is measured in Epoch Periods. An Epoch Period is composed of a set number of blocks. The number of blocks for an Epoch period will be approximately 100 blocks and can be adjusted through governance.

### **Interfaces for Staking-Pallet**

### **Config**

```rust

#[pallet::config]
pub trait Config: frame_system::Config {
    /// The lockable staking currency.
    type Currency: LockableCurrency<Self::AccountId, Moment = Self::BlockNumber>;

    /// The minimum required token amount to stake. It facilitates cleaning dust when unstaking.
    #[pallet::constant]
    type MinimumStakingAmount: Get<Self::Balance>;

    /// The maximum number of `unlocking` chunks a `StakingAccountLedger` can have. It determines how many unique Epochs a Staker may be unstaked in.
    #[pallet::constant]
    type MaxUnlockingChunks: Get<u32>;

    /// The epoch number provider.
    type EpochProvider: BlockNumberProvider<EpochNumber = u32>

    /// The number of Epochs before you can unlock tokens after unstaking.
    type UnstakingThawPeriod: Get<u32>;
}

```

### **Constants**

LockIdentifier is an eight-character long identifier used to distinguish between different locks.

```rust

/// LockIdentifier is an eight-character long identifier used to distinguish between different locks.
const STAKING_ID: LockIdentifier = *b"ntwstkg";

```

### **Calls**

**Stake**

Stakes some amount of tokens to the network and generates Capacity.

```rust

/// Stakes some amount of tokens to the network and generates Capacity.
///
/// ### Errors
///
/// - Returns Error::AlreadyStakedBalance if staker tried to decrease stake amount.
/// - Returns Error::InsufficientBalance if the sender does not have enough to cover the amount wanting to stake.
/// - Returns Error::InvalidMsa if attempting to stake to a non-registered provider MSA account.
pub fn stake(origin: OriginFor<T>, account: MessageSourceId, amount: BalanceOf<T>) -> DispatchResult {}

```

Acceptance Criteria are listed below but can evolve:

1. Dispatched origin is Signed by Staker.
2. A Target MSA account must be a Registered Provided.
3. A token amount staked must not be greater than the free balance.
4. A Staker can only target an MSA of a Registered Provider.
5. A Staker can stake multiple times and target different providers.
6. The token amount staked is to remain [locked](https://paritytech.github.io/substrate/master/frame_support/traits/trait.LockableCurrency.html) with reason [WithdrawReasons::all()](https://paritytech.github.io/substrate/master/frame_support/traits/tokens/struct.WithdrawReasons.html#method.all).
7. Capacity is generated with a configurable capacity-generating function.
8. Target Registered Provider is issued generated Capacity.
9. Target Registered Provider issued Capacity becomes available at the start of the next Epoch Period.
10. Stakers can increase their staking amount.

Note that we are considering allowing locked tokens to be used to pay transaction fees.

**Unstake**

Schedules an amount of the stake to be unlocked.

```rust

/// Schedules an amount of the stake to be unlocked.
/// ### Errors
///
/// - Returns Error::UnstakedAmountIsZero Unstaking amount should be greater than zero.
/// - Returns Error::NoMoreChunks if attempting to unlock more than allowed config::MaxUnlockingChunks.
pub fn unstake(origin: OriginFor<T>, account: MessageSourceId, amount: BalanceOf<T>) -> DispatchResult {}

```

Acceptance Criteria are listed below but can evolve:

1. Dispatched origin is Signed by Staker.
2. Schedules a portion of the stake to be unlocked and ready for transfer after the `confg::UnstakingThawPeriod` ends.
3. The amount unstaked must be greater than 0.
4. Issued Capacity to the target Registered Provider is reduced.
5. The amount unstaked cannot exceed the amount staked.
6. Staking accounts whose balance goes below `config::MinimumStakingAmount` will be unstake the entire balance to avoid leaving dust.

**withdraw_unstaked**

Remove locks from unstaked chunks which have completed UnstakingThawPeriod.

```rust

/// Remove locks from unstaked chunks which have completed UnstakingThawPeriod.
pub fn withdraw_unstaked(origin: OriginFor<T>) -> DispatchResultWithPostInfo {}

```

Acceptance Criteria are listed below but can evolve.

1. Dispatched origin is Signed by Staker.
2. Sums all chunks that are less than or equal to the current Epoch and removes the lock by amount from the account balance.
3. Updates `StakingAccountLedger` total with new locking amount.
4. If an account has nothing at stake, clean up storage by removing StakingLedger and TargetLedger entries.
5. Emits event Withdrawn to notify that a withdrawal was made.

### **Errors**

```rust

pub enum Error<T> {
  /// Staker tried to decrease stake.
  AlreadyStakedBalance,
  /// Staker has insufficient balance to cover the amount wanting to stake.
  InsufficientBalance,
  /// Staker attempted to stake to an invalid MSA.
  NotRegisteredMsa,
  /// Staking amount is below the minimum amount required.
  BelowMinStakingAmount,
  /// Unstaking amount should be greater than zero.
  UnstakedAmountIsZero,
  /// Account address is not staking
  NotStakingAccount,
  /// Unstaking amount is greater than the total contributed.
  AmountUnstakingExceedsBalance,
  /// Staker reached the limit number for the allowed amount of unlocking chunks.
  MaxUnlockingChunks
}

```

### **Events**

```rust

pub enum Event<T: Config> {
  /// Tokens have been staked to an MSA.
  Staked {
    /// The token account that staked tokens to the network.
    account: T::AccountId,
    /// The MSA that a token account targeted to receive Capacity.
    msa_id: MessageSourceId,
    /// An amount that was staked.
    amount: BalanceOf<T>
  },

  /// A token account has unstaked to an MSA.
  UnStake {
    /// The token account that staked tokens to the network.
    account: T::AccountId,
    /// The MSA that a token account targeted to receive Capacity.
    msa_id: MessageSourceId,
    /// An amount that was unstaked.
    amount: BalanceOf<T>
   },

  /// The token amount that was previously unstaked and now withdrawn by unlocking.
  Withdrawn {
    /// The token account that staked tokens to the network.
    account: T::AccountId,
    /// An amount that was withdrawn.
    amount: BalanceOf<T>
  }
}

```

### **Storage**

**Staking Storage**

Storage for keeping records of staking accounting.

```rust

/// Storage for keeping a ledger of staked token amounts for accounts.
#[pallet::storage]
pub type StakingAccountLedger<T: Config> =
  StorageMap<_, Twox64Concat, T::AccountId, StakingAccountDetails<T::Balance>>;

```

Storage for to record how many tokens were targeted to an MSA.

```rust

/// Storage to record how many tokens were targeted to an MSA.
#[pallet::storage]
pub type StakingTargetLedger<T: Config> =
  StorageDoubleMap<_, Twox64Concat, T::AccountId, Twox64Concat, MessageSourceId, StakingTargetDetails<T::Balance>>;
```

The type used for storing information about the targeted MSA that received Capacity.

```rust
/// Details about the total token amount targeted to an MSA.
/// The amount of Capacity that the target will receive.
pub struct StakingTargetDetails<Balance> {
  /// The total amount of tokens that have been targeted to the MSA.
  pub amount: Balance,
  /// The total amount of Capacity that an MSA received.
  pub capacity: Balance,
}

```

The type used for storing information about staking details.

```rust

pub struct StakingAccountDetails<Balance, BlockNumber> {
  /// The amount a Staker has stacked minus the sum of all tokens waiting to be unlocked.
  pub active: Balance
  /// The total amount of tokens Staker has locked.
  pub total: Balance,
  /// Unstaked balances that will be made available.
  pub unlocking: BoundedVec<UnlockChunk<BalanceOf<T>>, T::MaxUnlockingChunks>,
}

```

The type that is used to record a single request for a number of tokens to be unlocked.

```rust

pub struct UnlockChunk<Balance: HasCompact> {
  /// Amount to be unlocked.
  #[codec(compact)]
  value: Balance,
  /// Epoch number at which point funds are unlocked.
  #[codec(compact)]
  epoch: EpochIndex,
}

```

### **Interfaces for Capacity-Pallet**

### **Calls**

**Set_epoch_period**

The extrinsic that sets the Epoch Period through governance.

```rust

/// Sets the Epoch Period through governance.
///
/// ### Errors
///
/// - Returns Error::BadOrigin if sender is not root.
pub fn set_epoch_period(origin: OriginFor<T>, blocks: MessageSourceId) {}

```

Acceptance Criteria are listed below but can evolve:

1. Origin is Root.
2. Sets the new Epoch-Period.
3. New Epoch-Period begins at the Next Epoch's start.

**Capacity Storage**

Storage for the issuance of Capacity to Registered Providers:

```rust

/// Storage for an MSA's Capacity balance details.
#[pallet::storage]
pub type CapacityOf<T: Config> =
  StorageMap<_, Blake2_128Concat, MessageSourceId, CapacityDetails<T::Balance>>;

```

The type for storing Registered Provider Capacity balance:

```rust

pub struct CapacityDetails<Balance> {
  /// The amount of Capacity remaining for the `last_replenished_epoch`.
  pub remaining: Balance,
  /// The total Capacity issued to an MSA.
  pub total_available: Balance,
  /// The last Epoch that an MSA was replenished.
  pub last_replenished_epoch: u32,
}

```

### **Traits**

As mentioned above, Capacity is non-transferable and implements the following interface to reduce and increase capacity on an MSA.

```rust

traits Nontransferable {
  type Balance;

  /// The available Capacity for an MSA account.
  fn available(msa_id: MessageSourceId) -> Result<Balance, DispatchError>;

  /// Reduce the available Capacity of an MSA account.
  fn reduce_available(msa_id: MessageSourceId, amount: Balance) -> Result<Balance, DispatchError>;

  /// Increase the available Capacity for an MSA account.
  fn increase_available(msa_id: MessageSourceId, amount: Balance) -> Result<Balance, DispatchError>;
}

```

**Implementation of how to Replenish** <a id='replenish'></a>
Replenishable means that all Capacity is replenished after a fixed period called an Epoch Period. An Epoch Period is composed of a set number of blocks. In the example below, the Epoch Period is three blocks. The initial Epoch Period will be around 100 blocks. This Epoch Period can be modified through governance.

![https://user-images.githubusercontent.com/3433442/189949840-cafc3b2f-5af7-4a65-8610-81dbe42a69ce.png](https://user-images.githubusercontent.com/3433442/189949840-cafc3b2f-5af7-4a65-8610-81dbe42a69ce.png)

Capacity can be replenished by making your first Capacity transaction during a new Epoch Period.

![https://user-images.githubusercontent.com/3433442/189948939-6b85465a-f9d9-4330-b887-561c7f0283b1.png](https://user-images.githubusercontent.com/3433442/189948939-6b85465a-f9d9-4330-b887-561c7f0283b1.png)

The following interface is implemented on Capacity-Pallet to facilitate replenishment:

### **Hooks**

```rust

#[pallet::hooks]
impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
  fn on_initialize(_now: BlockNumberFor<T>) -> Weight {}
}

```

Acceptance Criteria are listed below but can evolve:

1. After a fixed number of blocks, a new Epoch Period begins.
2. At the start of a new Epoch Period, `EpochNumber` storage is increased by 1.
3. At the start of a new block, `CurrentBlockUsedCapacity` storage is reset.

### Traits

Replenishable trait implemented on Capacity-Pallet. This trait is used to replenish the Capacity of a  Registered Provider.

```rust

trait Replenishable {
  type Balance;

  /// Replenish an MSA's Capacity by an amount.
  fn replenish_by_account(msa_id: MessageSourceId, amount: Balance) -> Result<Balance, DispatchError> {};

  /// Replenish all Capacity balance for an MSA.
  fn replenish_all_for_account(msa_id: MessageSourceId) -> Result<Balance, DispatchError>;

  /// Checks if an account can be replenished.
  fn can_replenish(msa_id: MessageSourceId) -> bool;
}

```

`EpochNumberProvider` provides an abstraction over an arbitrary way of providing the current epoch number.

```rust

pub trait EpochNumberProvider {
  /// Type of `EpochNumber` to provide.
  type EpochNumber: Codec + Clone + Ord + Eq + AtLeast32BitUnsigned;

  /// Provides an abstraction over an arbitrary way of providing the
  /// current epoch number.
  fn current_epoch_number() -> Self::EpochNumber;

  /// It allows for setting the block number that will later be fetched
  /// This is useful in case the block number provider is different from than System
  #[cfg(feature = "runtime-benchmarks")]
  fn set_epoch_number(_block: Self::EpochNumber) {}
}

```

**Storage**

`EpochNumber` help keep count of the number of Epoch-Periods:

```rust

/// Storage for keeping count of the number of Epoch periods.
#[pallet::storage]
pub type EpochNumber<T> = StorageValue<_, u32, ValueQuery>;

```

To facilitate keeping track of the amount of Capacity consumed in a block.

```rust

/// Storage to keep track of the amount of Capacity consumed in a block.
#[pallet::storage]
pub type CurrentBlockUsedCapacity<T: Config> = StorageValue<_, BalanceOf<T>, ValueQuery>;

```

**Prioritization of Capacity transactions** <a id='priority'></a>

Substrate default prioritization is composed of the transaction length, weight, and tip. Adding a tip allows you to increase your priority and thus increases the chance that your transaction is added to the next block.

Capacity transactions do not have the ability to tip, unlike token transactions. This puts Capacity transactions at a disadvantage because in times of high congestion tokens transactions can prevent Capacity transactions from being included in a block.

To prevent token transactions from dominating block space, we prioritize Capacity transactions over token transactions. Additionally, we put a limit on the amount of block space Capacity transactions can consume. This new priority allows Capacity transactions to fill up their allocated space first and once the limit has been reached allow for token transactions to fill up the remaining block. We flip the prioritization in this manner because we expect more Capacity transactions than non-capacity transactions. The following section will describe how the block space is filled.

**Block space allocation for Capacity transactions** <a id='block-space'></a>

We expect more Capacity transactions versus non-capacity transactions. To prevent Capacity transactions from dominating block space, we extend what Substrate does to distribute block space among Mandatory, Operational, and Normal transactions.

In Substrate, a max limit is imposed on how much block space Mandatory, Operational, and Normal transactions can consume. Once that limit is reached, transactions are returned to the transaction pool for reprocessing. Below you can see that three Normal transactions have not reached the `max total`.

![https://user-images.githubusercontent.com/3433442/189948974-5dc537ad-2e87-4425-9616-6e93e7b69c2b.png](https://user-images.githubusercontent.com/3433442/189948974-5dc537ad-2e87-4425-9616-6e93e7b69c2b.png)

Similarly, we impose a limit on how much space Capacity transactions can consume from Normal transactions. This new configurable limit can be set by governance.

![https://user-images.githubusercontent.com/3433442/189949020-7bdd2e34-5323-4264-a821-1dcbb0063c20.png](https://user-images.githubusercontent.com/3433442/189949020-7bdd2e34-5323-4264-a821-1dcbb0063c20.png)

A [SignedExtension](https://paritytech.github.io/substrate/master/sp_runtime/traits/trait.SignedExtension.html) trait is implemented so that once the Capacity transaction has reached the `max_total` of allocated Capacity space, the transaction is put back into the transaction pool. Below illustrates the Capacity transaction SignedExtension flow.

![https://user-images.githubusercontent.com/3433442/189949048-7d19a194-701d-4267-ae1a-0333ee665ae7.png](https://user-images.githubusercontent.com/3433442/189949048-7d19a194-701d-4267-ae1a-0333ee665ae7.png)

A type for implementing the SignedExtension trait:

```rust

/// A type that implements SignedExtension that checks to see if Capacity transaction allocated
/// weight has been reached.
pub struct CheckCapacityWeight<T: Config + Send + Sync>(sp_std::market::PhantomData<T>);

```

```rust

impl<T: Config + Send + Sync> SignedExtension for CheckCapacityWeight<T>
  where T::Call: Dispachable<Info = DispatchInfo> + IsSubtype<Call<T>>,
{
  type AccountId = T::AccountId;
  type Call = T::Call;
  type AdditionalSigned = ();
  type Pre = ();

  fn additional_signed(&self) -> sp_std::result::Result<(), TransactionValidityError> {
    Ok(())
  }

  fn pre_validate() -> Result<(), TransactionValidityError> {}

  /// Below describes the interfaces for validate, pres_dispatch and post_dispatch
}

```

SignedExtension validate

```rust

/// Validates that extrinsic does not exceed max-total of Capacity transactions
///
/// ### Errors
///
/// - Returns InvalidTransaction::ExhaustsResource if transaction is greater than
///   max-total for Capacity Transactions
fn validate(
  &self,
  _who: &Self::AccountId,
  call: &Self::Call,
  info: &DispatchInfoOf<Self::Call>,
  len: usize,
) -> TransactionValidity {}

```

Acceptance Criteria are listed below but can evolve:

1. Checks that the extrinsic does not exceed the size of the `max_total` allocated space.

SignedExtension pre-dispatch

```rust

/// Validates that extrinsic does not exceed max-total of Capacity transactions
///
/// ### Errors
///
/// - Returns InvalidTransaction::ExhaustsResource if transaction fails checks.
fn pre_dispatch(
  self,
  _who: &Self::AccountId,
  _call: &Self::Call,
  info: &DispatchInfoOf<Self::Call>,
  len: usize,
) -> Result<(), TransactionValidityError> {}

```

Acceptance Criteria are listed below but can evolve:

1. Only run validation, pre-dispatch, and post-dispatch on calls that match Capacity Transactions.
2. Adding the Capacity transaction weight to the block-weight total should not cause an overflow.
3. Given Call is a Capacity transaction, it checks that the extrinsic does not exceed the size of the `max_total` allocated weight.
4. Given Call is a Capacity Transaction, it checks that adding the transaction *length* will not exceed the [max length](https://paritytech.github.io/substrate/master/frame_system/limits/struct.BlockLength.html) for the Normal dispatch class.
5. Given the call is a Capacity transaction, checks that adding the weight of the transaction will not exceed the `max_total` weight of Normal transactions
    1. base_weight + transaction weight + total weight < current total weight of normal transactions.
6. Given Call is a Capacity transaction, check that adding the transaction weight will not exceed the `max_total` weight of Capacity Transactions.
    1. base_weight + transaction weight + total weight < current total weight of Capacity transactions.
7. Increases `CurrentBlockUsedCapacity` storage.

SignedExtension post-dispatch

```rust

fn post_dispatch(
  _pre: Option<Self::Pre>,
  info: &DispatchInfoOf<Self::Call>,
  post_info: &PostDispatchInfoOf<Self::Call>,
  _len: usize,
  result: &DispatchResult,
) -> Result<(), TransactionValidityError> {}

```

Acceptance Criteria are listed below but can evolve:

1. Subtract the actual weight of the transaction from the estimated weight to see if there was a difference and adjust `CurrentBlockUsedCapacity` by subtracting the difference.

**Implementation of using Capacity** <a id='capacity-transactions'></a>

**Transaction payment**

When submitting a transaction, it is validated at the transaction pool before including it in a block. The validation is implemented with a [SignedExtension](https://docs.rs/sp-runtime/latest/sp_runtime/traits/trait.SignedExtension.html) that validates that the signer has enough token or Capacity to submit the transaction.

![https://user-images.githubusercontent.com/3433442/189948536-ee02784f-7507-4e8c-b28a-0e8ec94de297.png](https://user-images.githubusercontent.com/3433442/189948536-ee02784f-7507-4e8c-b28a-0e8ec94de297.png)

Capacity introduces an additional form of payment for transacting. As a result, FRAME's Transaction-Payment-Pallet can be modified or wrapped to toggle between token and Capacity transactions. The following implementation introduces the Dual-Payment-Pallet, a wrapper for the Transaction-Payment-Pallet, and augments it with additional functionality. In addition, it implements the `pay_with_capacity` extrinsic used to distinguish between Capacity transactions and Token transactions.

**Calls**

`ChargeTransactionPayment` struct type is used to implement a SignedExtension which validates that the signer has enough Capacity or Token to transact. The struct is a named tuple that holds a tip amount. Note that tipping is only limited to Token transactions. Capacity transactions cannot tip. Any tip that is added to Capacity transactions is ignored.

```rust

/// A type that is used to implement a SignedExtension trait. It handles reducing
/// the balance of a Capacity or Token transaction.
#[derive(Encode, Decode, Clone, Eq, PartialEq, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct ChargeTransactionPayment<T: Config>(#[codec(compact)] BalanceOf<T>);

```

`ChargeTransactionPayment` implements a `withdraw_fee` method to resolve and withdraw payment fees from either a Token or Capacity account. If the signer does not have enough to pay for transaction errors with a `TransactionValidityError` and drops the transaction from the pool during the validation phase.

```rust

impl<T: Config> ChargeTransactionPayment<T>
where
  CallOf<T>: Dispatchable<Info = DispatchInfo, PostInfo = PostDispatchInfo> + IsSubType<Call<T>> + From<CallOf<T>>,
  BalanceOf<T>: Send + Sync + FixedPointOperand + IsType<ChargeCapacityBalanceOf<T>>,
{
  /// Withdraws fees from either Token or Capacity transactions.
  ///
  /// ### Errors
  ///
  /// - Returns InvalidTransaction::Payment if transaction
  /// Capacity or Token does not have enough to cover the transaction fee.
  fn withdraw_fee(
    &self,
    who: &T::AccountId,
    call: &CallOf<T>,
    info: &DispatchInfoOf<CallOf<T>>,
    len: usize,
  ) -> Result<(BalanceOf<T>, InitialPayment<T>), TransactionValidityError> {}
}

```

Acceptance Criteria are listed below but can evolve:

1. Given a Capacity transaction, withdraw the fee from the Capacity account balance.
2. Given a Token transaction, withdraw the fee from the Token account balance using the Transaction-Payment-Pallet withdrawal function for Token accounts.
3. The result includes an enum describing how the payment was made.
4. Given a free transaction, skip any withdrawals.

An enum is used for describing whether the payment was made with Capacity, Token or free. This enum becomes useful post-dispatch to issue a refund if there was an overcharge for the fee payment.

```rust

/// Types for handling how the payment will be processed.
/// This type is passed to Post-dispatch to be able to distinguish how to reimburse overcharges in fee payment.
#[derive(Encode, Decode, DefaultNoBound, TypeInfo)]
pub enum InitialPayment<T: Config> {
  /// Pay no fee.
  Nothing,
  /// Pay fee with Token.
  Token(LiquidityInfoOf<T>),
  /// Pay fee with Capacity.
  Capacity(ChargeCapacityBalanceOf<T>),
}

```

Below are the interfaces of the SignedExtension that ChargeTransactionPayment implements.

```rust

/// Implement signed extension SignedExtension to validate that a transaction payment can be withdrawn for a Capacity or Token account. This allows transactions to be dropped from the transaction pool if the signer does not have enough to pay the fee. Pre-dispatch withdraws the actual payment from the account, and Post-dispatch refunds over charges made at pre-dispatch.
impl<T: Config + Send + Sync> SignedExtension for ChargeTransactionPayment<T>
where
  BalanceOf<T>: Send + Sync + FixedPointOperand + From<u64> + IsType<ChargeCapacityBalanceOf<T>>,
  CallOf<T>: Dispatchable<Info = DispatchInfo, PostInfo = PostDispatchInfo> + IsSubType<Call<T>>,
{
  const IDENTIFIER: &'static str = "ChargePayment";
  type AccountId = T::AccountId;
  type Call = CallOf<T>;
  type AdditionalSigned = ();
  /// The type that gets past to post-dispatch.
  /// The InitialPayment allows post-dispatch to know to what account
  /// a refund should be applied.
  type Pre = (BalanceOf<T>, Self::AccountId, InitialPayment<T>);

  /// Below, you can find validate, pre-dispatch, and post-dispatch interfaces.
  ...
}

```

```rust

/// Validate that payment can be withdrawn from the Capacity or Token account.
///
/// ### Errors
///
/// - Returns InvalidTransaction::Payment if transaction
/// Capacity or Token does not have enough to cover the transaction fee.
fn validate(
  &self,
  who: &Self::AccountId,
  call: &Self::Call,
  info: &DispatchInfoOf<CallOf<T>>,
  len: usize,
) -> TransactionValidity {}

```

Acceptance Criteria are listed below but can evolve:

1. Checks if the fee can be withdrawn from Token or Capacity balances.
2. Resolves the priority based on weight, tip, and transaction length. Note that the transaction priority can be calculated using the `get_priority` function from Transaction-Payment-Pallet.

```rust

fn pre_dispatch(
  self,
  who: &Self::AccountId,
  call: &Self::Call,
  info: &DispatchInfoOf<Self::Call>,
  len: usize,
) -> Result<Self::Pre, TransactionValidityError> {}

```

Acceptance Criteria are listed below but can evolve:

1. Validates that a withdrawal can be made from Token or Capacity balance.
2. Withdraws payment for the transaction fee from either Token or Capacity balance.

Notice that Pre-dispatch returns a type `Pre`; this is the type that gets passed from pre-dispatch to post-dispatch function. The associated type consists of a tuple that includes: the tip, account, and how the initial payment was made. This lets post-dispatch know how the fee was paid for in Capacity, Token, or no cost.

After the transaction is authored, the post-dispatch is responsible for refunding any overcharged Capacity or Token payment. Using the type associated type, `Pre`, that gets passed in from the pre-dispatch function, it corrects the fee refunding the amount overcharged.

```rust

fn post_dispatch(
  pre: Self::Pre,
  info: &DispatchInfoOf<Self::Call>,
  post_info: &PostDispatchInfoOf<CallOf<T>>,
  len: usize,
  result: &DispatchResult,
) -> Result<(), TransactionValidityError> {}

```

Acceptance Criteria are listed below but can evolve:

1. Issue overpayment for Token transaction.
2. Given transaction is free, nothing needs to be refunded.

Note that Capacity transactions do not get refunded for overcharges.

## Non-goals

Staking rewards and re-staking are left for another design document.

## Benefits and Risk

The benefit of implementing Capacity is that it allows applications to increase their users by reducing costs.

## Alternatives and Rationale

Here I will discuss two alternative options for managing congestion with different ways to create new Epoch Periods:

1. Create a new Epoch Period based on total Capacity usage.
2. Create a new Epoch Period based on the moving average of used Capacity.

**Create a new Epoch Period based on total Capacity usage**

Epochs Periods are used to manage congestion on the network. Instead of having a contiguous fixed Epoch Period at the end of the current Epoch Period, we can change the length of the next Epoch based on network demand. We can calculate demand for Capacity based on the current Epoch “fullness.” The Epoch “fullness” is a target used to increase or decrease the next Epoch Period to keep the total Capacity used in an Epoch as close as possible to the target.

This target would be configurable and can be called `config::epochTarget`. In addition, we also configure a multiplier function that calculates how much the next Epoch period should increase or decrease. This can be defined as `config::epochUtilizationMultiplier`.

![https://user-images.githubusercontent.com/3433442/189948635-b2817eae-d23c-4f5b-bef8-77643d5336ea.png](https://user-images.githubusercontent.com/3433442/189948635-b2817eae-d23c-4f5b-bef8-77643d5336ea.png)

The above illustrates two epochs where the second one contracts because network congestion has decreased. As a result of the epoch decreasing, Capacity is replenished faster.

Upon finalizing each block, we get the total amount of Capacity used and update the total amount of weight for an Epoch.

![https://user-images.githubusercontent.com/3433442/189948747-03fbb85e-caff-4771-8d24-427406142c65.png](https://user-images.githubusercontent.com/3433442/189948747-03fbb85e-caff-4771-8d24-427406142c65.png)

### **Storage**

To facilitate keeping track of the amount of Capacity consumed during an Epoch Period. 

```rust

#[pallet::storage]
pub type CurrentEpochUsedCapacity<T: Config> =
  StorageValue<_, BalanceOf<T>, ValueQuery>;

```

### **Hooks**

```rust

#[pallet::hooks]
impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
  fn on_finalize(_now: BlockNumberFor<T>) -> Weight {}
}

```

Acceptance Criteria are listed below but can evolve:

1. After a fixed number of blocks, a new Epoch Period begins.
2. At the end of an Epoch Period, `EpochNumber` storage is increased by 1.
3. At the end of an Epoch Period, calculate the next epoch length.
4. At the end of a new block, `CurrentBlockUsedCapacity` storage is reset.
5. At the end of a new block, `CurrentEpochUsedCapacity` storage is incremented with the total Capacity used in the previous block.

**Create a new Epoch Period based on the moving average of used Capacity**

To manage congestion, the following solution uses the moving average of Capacity used after each block to calculate the next Epoch Period. Unlike the previous implementation, a new Epoch Period is created after the moving average of used Capacity goes below a configurable threshold called `config::MovingAverageBound`. An essential difference from the other solutions is that it becomes less predictable to know when a new Epoch Period starts.

To compute the moving average, an additional configuration is necessary to set the window size of the moving average called `config::MovingAverageWindowSize`.

A “circular queue” storage is used in the Capacity Pallet to track how much Capacity is used in a block.

### Storage

```rust

/// Storage for used Capacity
#[pallet::storage]
pub type QueueUsedCapacity<T: Config> =
  StorageValue<_, BoundedVec<BalanceOf<T>, T::MovingAverageWindowSize>, ValueQuery>;

```

`QueueUsedCapacity` storage is updated similarly to the SignedExtension implemented for the solution above. However, a noticeable difference is that Capacity used for the current block is inserted into a circular queue. After inserting into the last index of the queue, used Capacity is inserted into the beginning of the queue and continues circularly. The index to store the current used Capacity can be computed by taking the modulus of the current block number with`T::MovingAverageWindowSize`.

![https://user-images.githubusercontent.com/3433442/189948793-57d73dc2-9fee-4d74-ae7a-821b597c8ef0.png](https://user-images.githubusercontent.com/3433442/189948793-57d73dc2-9fee-4d74-ae7a-821b597c8ef0.png)

Assuming that the target threshold is 2 for used Capacity, a new Epoch period cannot be started since the moving average at block four is 4 ( 6 + 4 + 2 / 3). The moving average will begin to drop as time goes on and Registered Providers start to run out of Capacity.

The illustration below shows that the moving average is calculated after every block.

![https://user-images.githubusercontent.com/3433442/189948822-c2ac1c59-dd53-4888-9a15-1011c6246141.png](https://user-images.githubusercontent.com/3433442/189948822-c2ac1c59-dd53-4888-9a15-1011c6246141.png)

### **Hooks**

```rust

#[pallet::hooks]
impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
  fn on_finalize(_now: BlockNumberFor<T>) -> Weight {}
}

```

Acceptance Criteria are listed below but can evolve:

1. At the end of a block, compute the moving average and start a new Epoch Period if below `config::MovingAverageBound`.
2. Given the moving average goes below the threshold, start a new Epoch and increment Epoch number storage by one.

Note that the moving average should start being calculated at the end of every block after filling up the queue.