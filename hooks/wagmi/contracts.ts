import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curat AI Token
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curatAiTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_roleManager', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AI_AGENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CURATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DAILY_MINT_AMOUNT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'INITIAL_SUPPLY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SETTLEMENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTING_CONTRACT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'distribute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastMintTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mintDailyRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'roleManager',
    outputs: [
      { name: '', internalType: 'contract IRoleManager', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curate AI Posts
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curateAiPostsAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_roleManager', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'author',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'contentHash',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      { name: 'tags', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'PostCreated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AI_AGENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CURATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SETTLEMENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTING_CONTRACT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contentHash', internalType: 'string', type: 'string' },
      { name: 'tags', internalType: 'string', type: 'string' },
    ],
    name: 'createPost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'postId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPostScore',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'postId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPosts',
    outputs: [
      {
        name: 'post',
        internalType: 'struct CurateAIPost.Post',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'author', internalType: 'address', type: 'address' },
          { name: 'contentHash', internalType: 'string', type: 'string' },
          { name: 'totalScore', internalType: 'uint256', type: 'uint256' },
          { name: 'claimedScore', internalType: 'uint256', type: 'uint256' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'tags', internalType: 'string', type: 'string' },
          { name: 'newVote', internalType: 'bool', type: 'bool' },
          { name: 'aiVoted', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'postCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'posts',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'author', internalType: 'address', type: 'address' },
      { name: 'contentHash', internalType: 'string', type: 'string' },
      { name: 'totalScore', internalType: 'uint256', type: 'uint256' },
      { name: 'claimedScore', internalType: 'uint256', type: 'uint256' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'tags', internalType: 'string', type: 'string' },
      { name: 'newVote', internalType: 'bool', type: 'bool' },
      { name: 'aiVoted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'roleManager',
    outputs: [
      { name: '', internalType: 'contract IRoleManager', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'postId', internalType: 'uint256', type: 'uint256' }],
    name: 'setAIVoted',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'postId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPostScore',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curate AI Role Manager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curateAiRoleManagerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assigner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AIAgentAssigned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assigner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CuratorAssigned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assigner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ModeratorAssigned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'revoker',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ModeratorRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'settlementContract',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'setter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SettlementContractSet',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AI_AGENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CURATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MODERATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SETTLEMENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SUPER_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTING_CONTRACT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: '_curator_counter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'assignAIAgent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'assignCurator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'assignModerator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isSettlementLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'revokeModerator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'settlementContract', internalType: 'address', type: 'address' },
      { name: 'votingContract', internalType: 'address', type: 'address' },
    ],
    name: 'setSettlementAndVotingContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curate AI Settlement
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curateAiSettlementAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_tokenAddress', internalType: 'address', type: 'address' },
      { name: '_votingAddress', internalType: 'address', type: 'address' },
      { name: '_roleManager', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'day', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'totalReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DailySettlement',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'totalAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsClaimed',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AI_AGENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CURATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SETTLEMENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTING_CONTRACT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'dailyRewards',
    outputs: [
      { name: 'totalReward', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardPerVote', internalType: 'uint256', type: 'uint256' },
      { name: 'settled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getClaimableAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentDay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'roleManager',
    outputs: [
      { name: '', internalType: 'contract IRoleManager', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'day', internalType: 'uint256', type: 'uint256' }],
    name: 'settleDay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [
      {
        name: '',
        internalType: 'contract IContentMediaToken',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'voting',
    outputs: [
      { name: '', internalType: 'contract ICurateAIVote', type: 'address' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curate AI Vote
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const curateAiVoteAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_tokenAddress', internalType: 'address', type: 'address' },
      { name: '_roleManager', internalType: 'address', type: 'address' },
      { name: '_postContract', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'postId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'voter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Voted',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AI_AGENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CURATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SETTLEMENT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTES_PER_DAY_MULTIPLIER',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VOTING_CONTRACT',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'postId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'aiVote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'clearUserVoteDays',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'dailyAuthorVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'dailyPostVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'dailyVoteTotals',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'day', internalType: 'uint256', type: 'uint256' },
      { name: 'author', internalType: 'address', type: 'address' },
    ],
    name: 'getAuthorVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'day', internalType: 'uint256', type: 'uint256' }],
    name: 'getDailyTotalVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserVoteDays',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'lastVoteResetTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'postContract',
    outputs: [
      { name: '', internalType: 'contract ICurateAIPost', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'roleManager',
    outputs: [
      { name: '', internalType: 'contract IRoleManager', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [
      {
        name: '',
        internalType: 'contract IContentMediaToken',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userActiveDays',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'postId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'votesUsedToday',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Token Sale
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenSaleAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'ethAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensPurchased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RATE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'buyTokens',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawRemainingTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__
 */
export const useReadCuratAiToken = /*#__PURE__*/ createUseReadContract({
  abi: curatAiTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"AI_AGENT_ROLE"`
 */
export const useReadCuratAiTokenAiAgentRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'AI_AGENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"CURATOR_ROLE"`
 */
export const useReadCuratAiTokenCuratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'CURATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"DAILY_MINT_AMOUNT"`
 */
export const useReadCuratAiTokenDailyMintAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'DAILY_MINT_AMOUNT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"INITIAL_SUPPLY"`
 */
export const useReadCuratAiTokenInitialSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'INITIAL_SUPPLY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"SETTLEMENT_ROLE"`
 */
export const useReadCuratAiTokenSettlementRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'SETTLEMENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"VOTING_CONTRACT"`
 */
export const useReadCuratAiTokenVotingContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'VOTING_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadCuratAiTokenAllowance = /*#__PURE__*/ createUseReadContract(
  { abi: curatAiTokenAbi, functionName: 'allowance' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadCuratAiTokenBalanceOf = /*#__PURE__*/ createUseReadContract(
  { abi: curatAiTokenAbi, functionName: 'balanceOf' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadCuratAiTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: curatAiTokenAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"lastMintTime"`
 */
export const useReadCuratAiTokenLastMintTime =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'lastMintTime',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadCuratAiTokenName = /*#__PURE__*/ createUseReadContract({
  abi: curatAiTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"roleManager"`
 */
export const useReadCuratAiTokenRoleManager =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'roleManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadCuratAiTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: curatAiTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadCuratAiTokenTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: curatAiTokenAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__
 */
export const useWriteCuratAiToken = /*#__PURE__*/ createUseWriteContract({
  abi: curatAiTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteCuratAiTokenApprove = /*#__PURE__*/ createUseWriteContract(
  { abi: curatAiTokenAbi, functionName: 'approve' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"distribute"`
 */
export const useWriteCuratAiTokenDistribute =
  /*#__PURE__*/ createUseWriteContract({
    abi: curatAiTokenAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"mintDailyRewards"`
 */
export const useWriteCuratAiTokenMintDailyRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: curatAiTokenAbi,
    functionName: 'mintDailyRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteCuratAiTokenTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: curatAiTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteCuratAiTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: curatAiTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__
 */
export const useSimulateCuratAiToken = /*#__PURE__*/ createUseSimulateContract({
  abi: curatAiTokenAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateCuratAiTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curatAiTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"distribute"`
 */
export const useSimulateCuratAiTokenDistribute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curatAiTokenAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"mintDailyRewards"`
 */
export const useSimulateCuratAiTokenMintDailyRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curatAiTokenAbi,
    functionName: 'mintDailyRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateCuratAiTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curatAiTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curatAiTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateCuratAiTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curatAiTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curatAiTokenAbi}__
 */
export const useWatchCuratAiTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: curatAiTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curatAiTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchCuratAiTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curatAiTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curatAiTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchCuratAiTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curatAiTokenAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__
 */
export const useReadCurateAiPosts = /*#__PURE__*/ createUseReadContract({
  abi: curateAiPostsAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"AI_AGENT_ROLE"`
 */
export const useReadCurateAiPostsAiAgentRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'AI_AGENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"CURATOR_ROLE"`
 */
export const useReadCurateAiPostsCuratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'CURATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"SETTLEMENT_ROLE"`
 */
export const useReadCurateAiPostsSettlementRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'SETTLEMENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"VOTING_CONTRACT"`
 */
export const useReadCurateAiPostsVotingContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'VOTING_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"getPostScore"`
 */
export const useReadCurateAiPostsGetPostScore =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'getPostScore',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"getPosts"`
 */
export const useReadCurateAiPostsGetPosts = /*#__PURE__*/ createUseReadContract(
  { abi: curateAiPostsAbi, functionName: 'getPosts' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"postCounter"`
 */
export const useReadCurateAiPostsPostCounter =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'postCounter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"posts"`
 */
export const useReadCurateAiPostsPosts = /*#__PURE__*/ createUseReadContract({
  abi: curateAiPostsAbi,
  functionName: 'posts',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"roleManager"`
 */
export const useReadCurateAiPostsRoleManager =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiPostsAbi,
    functionName: 'roleManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiPostsAbi}__
 */
export const useWriteCurateAiPosts = /*#__PURE__*/ createUseWriteContract({
  abi: curateAiPostsAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"createPost"`
 */
export const useWriteCurateAiPostsCreatePost =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiPostsAbi,
    functionName: 'createPost',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"setAIVoted"`
 */
export const useWriteCurateAiPostsSetAiVoted =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiPostsAbi,
    functionName: 'setAIVoted',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"setPostScore"`
 */
export const useWriteCurateAiPostsSetPostScore =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiPostsAbi,
    functionName: 'setPostScore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiPostsAbi}__
 */
export const useSimulateCurateAiPosts = /*#__PURE__*/ createUseSimulateContract(
  { abi: curateAiPostsAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"createPost"`
 */
export const useSimulateCurateAiPostsCreatePost =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiPostsAbi,
    functionName: 'createPost',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"setAIVoted"`
 */
export const useSimulateCurateAiPostsSetAiVoted =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiPostsAbi,
    functionName: 'setAIVoted',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiPostsAbi}__ and `functionName` set to `"setPostScore"`
 */
export const useSimulateCurateAiPostsSetPostScore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiPostsAbi,
    functionName: 'setPostScore',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiPostsAbi}__
 */
export const useWatchCurateAiPostsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: curateAiPostsAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiPostsAbi}__ and `eventName` set to `"PostCreated"`
 */
export const useWatchCurateAiPostsPostCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiPostsAbi,
    eventName: 'PostCreated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__
 */
export const useReadCurateAiRoleManager = /*#__PURE__*/ createUseReadContract({
  abi: curateAiRoleManagerAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"AI_AGENT_ROLE"`
 */
export const useReadCurateAiRoleManagerAiAgentRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'AI_AGENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"CURATOR_ROLE"`
 */
export const useReadCurateAiRoleManagerCuratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'CURATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadCurateAiRoleManagerDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"MODERATOR_ROLE"`
 */
export const useReadCurateAiRoleManagerModeratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'MODERATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"SETTLEMENT_ROLE"`
 */
export const useReadCurateAiRoleManagerSettlementRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'SETTLEMENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"SUPER_ADMIN_ROLE"`
 */
export const useReadCurateAiRoleManagerSuperAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'SUPER_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"VOTING_CONTRACT"`
 */
export const useReadCurateAiRoleManagerVotingContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'VOTING_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"_curator_counter"`
 */
export const useReadCurateAiRoleManagerCuratorCounter =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: '_curator_counter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadCurateAiRoleManagerGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadCurateAiRoleManagerHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"isSettlementLocked"`
 */
export const useReadCurateAiRoleManagerIsSettlementLocked =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'isSettlementLocked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadCurateAiRoleManagerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__
 */
export const useWriteCurateAiRoleManager = /*#__PURE__*/ createUseWriteContract(
  { abi: curateAiRoleManagerAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignAIAgent"`
 */
export const useWriteCurateAiRoleManagerAssignAiAgent =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignAIAgent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignCurator"`
 */
export const useWriteCurateAiRoleManagerAssignCurator =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignCurator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignModerator"`
 */
export const useWriteCurateAiRoleManagerAssignModerator =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignModerator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteCurateAiRoleManagerGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteCurateAiRoleManagerRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"revokeModerator"`
 */
export const useWriteCurateAiRoleManagerRevokeModerator =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'revokeModerator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteCurateAiRoleManagerRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"setSettlementAndVotingContract"`
 */
export const useWriteCurateAiRoleManagerSetSettlementAndVotingContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'setSettlementAndVotingContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__
 */
export const useSimulateCurateAiRoleManager =
  /*#__PURE__*/ createUseSimulateContract({ abi: curateAiRoleManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignAIAgent"`
 */
export const useSimulateCurateAiRoleManagerAssignAiAgent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignAIAgent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignCurator"`
 */
export const useSimulateCurateAiRoleManagerAssignCurator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignCurator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"assignModerator"`
 */
export const useSimulateCurateAiRoleManagerAssignModerator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'assignModerator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateCurateAiRoleManagerGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateCurateAiRoleManagerRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"revokeModerator"`
 */
export const useSimulateCurateAiRoleManagerRevokeModerator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'revokeModerator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateCurateAiRoleManagerRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `functionName` set to `"setSettlementAndVotingContract"`
 */
export const useSimulateCurateAiRoleManagerSetSettlementAndVotingContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiRoleManagerAbi,
    functionName: 'setSettlementAndVotingContract',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__
 */
export const useWatchCurateAiRoleManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: curateAiRoleManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"AIAgentAssigned"`
 */
export const useWatchCurateAiRoleManagerAiAgentAssignedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'AIAgentAssigned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"CuratorAssigned"`
 */
export const useWatchCurateAiRoleManagerCuratorAssignedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'CuratorAssigned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"ModeratorAssigned"`
 */
export const useWatchCurateAiRoleManagerModeratorAssignedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'ModeratorAssigned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"ModeratorRevoked"`
 */
export const useWatchCurateAiRoleManagerModeratorRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'ModeratorRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchCurateAiRoleManagerRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchCurateAiRoleManagerRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchCurateAiRoleManagerRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiRoleManagerAbi}__ and `eventName` set to `"SettlementContractSet"`
 */
export const useWatchCurateAiRoleManagerSettlementContractSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiRoleManagerAbi,
    eventName: 'SettlementContractSet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__
 */
export const useReadCurateAiSettlement = /*#__PURE__*/ createUseReadContract({
  abi: curateAiSettlementAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"AI_AGENT_ROLE"`
 */
export const useReadCurateAiSettlementAiAgentRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'AI_AGENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"CURATOR_ROLE"`
 */
export const useReadCurateAiSettlementCuratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'CURATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"SETTLEMENT_ROLE"`
 */
export const useReadCurateAiSettlementSettlementRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'SETTLEMENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"VOTING_CONTRACT"`
 */
export const useReadCurateAiSettlementVotingContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'VOTING_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"dailyRewards"`
 */
export const useReadCurateAiSettlementDailyRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'dailyRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"getClaimableAmount"`
 */
export const useReadCurateAiSettlementGetClaimableAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'getClaimableAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"getCurrentDay"`
 */
export const useReadCurateAiSettlementGetCurrentDay =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'getCurrentDay',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"roleManager"`
 */
export const useReadCurateAiSettlementRoleManager =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'roleManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"token"`
 */
export const useReadCurateAiSettlementToken =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'token',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"voting"`
 */
export const useReadCurateAiSettlementVoting =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiSettlementAbi,
    functionName: 'voting',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiSettlementAbi}__
 */
export const useWriteCurateAiSettlement = /*#__PURE__*/ createUseWriteContract({
  abi: curateAiSettlementAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useWriteCurateAiSettlementClaimRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiSettlementAbi,
    functionName: 'claimRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"settleDay"`
 */
export const useWriteCurateAiSettlementSettleDay =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiSettlementAbi,
    functionName: 'settleDay',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiSettlementAbi}__
 */
export const useSimulateCurateAiSettlement =
  /*#__PURE__*/ createUseSimulateContract({ abi: curateAiSettlementAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useSimulateCurateAiSettlementClaimRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiSettlementAbi,
    functionName: 'claimRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `functionName` set to `"settleDay"`
 */
export const useSimulateCurateAiSettlementSettleDay =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiSettlementAbi,
    functionName: 'settleDay',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiSettlementAbi}__
 */
export const useWatchCurateAiSettlementEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: curateAiSettlementAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `eventName` set to `"DailySettlement"`
 */
export const useWatchCurateAiSettlementDailySettlementEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiSettlementAbi,
    eventName: 'DailySettlement',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiSettlementAbi}__ and `eventName` set to `"RewardsClaimed"`
 */
export const useWatchCurateAiSettlementRewardsClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiSettlementAbi,
    eventName: 'RewardsClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__
 */
export const useReadCurateAiVote = /*#__PURE__*/ createUseReadContract({
  abi: curateAiVoteAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"AI_AGENT_ROLE"`
 */
export const useReadCurateAiVoteAiAgentRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'AI_AGENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"CURATOR_ROLE"`
 */
export const useReadCurateAiVoteCuratorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'CURATOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"SETTLEMENT_ROLE"`
 */
export const useReadCurateAiVoteSettlementRole =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'SETTLEMENT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"VOTES_PER_DAY_MULTIPLIER"`
 */
export const useReadCurateAiVoteVotesPerDayMultiplier =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'VOTES_PER_DAY_MULTIPLIER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"VOTING_CONTRACT"`
 */
export const useReadCurateAiVoteVotingContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'VOTING_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"dailyAuthorVotes"`
 */
export const useReadCurateAiVoteDailyAuthorVotes =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'dailyAuthorVotes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"dailyPostVotes"`
 */
export const useReadCurateAiVoteDailyPostVotes =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'dailyPostVotes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"dailyVoteTotals"`
 */
export const useReadCurateAiVoteDailyVoteTotals =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'dailyVoteTotals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"getAuthorVotes"`
 */
export const useReadCurateAiVoteGetAuthorVotes =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'getAuthorVotes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"getDailyTotalVotes"`
 */
export const useReadCurateAiVoteGetDailyTotalVotes =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'getDailyTotalVotes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"getTotalVotes"`
 */
export const useReadCurateAiVoteGetTotalVotes =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'getTotalVotes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"getUserVoteDays"`
 */
export const useReadCurateAiVoteGetUserVoteDays =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'getUserVoteDays',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"lastVoteResetTime"`
 */
export const useReadCurateAiVoteLastVoteResetTime =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'lastVoteResetTime',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"postContract"`
 */
export const useReadCurateAiVotePostContract =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'postContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"roleManager"`
 */
export const useReadCurateAiVoteRoleManager =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'roleManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"token"`
 */
export const useReadCurateAiVoteToken = /*#__PURE__*/ createUseReadContract({
  abi: curateAiVoteAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"userActiveDays"`
 */
export const useReadCurateAiVoteUserActiveDays =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'userActiveDays',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"votesUsedToday"`
 */
export const useReadCurateAiVoteVotesUsedToday =
  /*#__PURE__*/ createUseReadContract({
    abi: curateAiVoteAbi,
    functionName: 'votesUsedToday',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiVoteAbi}__
 */
export const useWriteCurateAiVote = /*#__PURE__*/ createUseWriteContract({
  abi: curateAiVoteAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"aiVote"`
 */
export const useWriteCurateAiVoteAiVote = /*#__PURE__*/ createUseWriteContract({
  abi: curateAiVoteAbi,
  functionName: 'aiVote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"clearUserVoteDays"`
 */
export const useWriteCurateAiVoteClearUserVoteDays =
  /*#__PURE__*/ createUseWriteContract({
    abi: curateAiVoteAbi,
    functionName: 'clearUserVoteDays',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"vote"`
 */
export const useWriteCurateAiVoteVote = /*#__PURE__*/ createUseWriteContract({
  abi: curateAiVoteAbi,
  functionName: 'vote',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiVoteAbi}__
 */
export const useSimulateCurateAiVote = /*#__PURE__*/ createUseSimulateContract({
  abi: curateAiVoteAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"aiVote"`
 */
export const useSimulateCurateAiVoteAiVote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiVoteAbi,
    functionName: 'aiVote',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"clearUserVoteDays"`
 */
export const useSimulateCurateAiVoteClearUserVoteDays =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiVoteAbi,
    functionName: 'clearUserVoteDays',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link curateAiVoteAbi}__ and `functionName` set to `"vote"`
 */
export const useSimulateCurateAiVoteVote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: curateAiVoteAbi,
    functionName: 'vote',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiVoteAbi}__
 */
export const useWatchCurateAiVoteEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: curateAiVoteAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link curateAiVoteAbi}__ and `eventName` set to `"Voted"`
 */
export const useWatchCurateAiVoteVotedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: curateAiVoteAbi,
    eventName: 'Voted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__
 */
export const useReadTokenSale = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"RATE"`
 */
export const useReadTokenSaleRate = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'RATE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadTokenSaleBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadTokenSaleDecimals = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"name"`
 */
export const useReadTokenSaleName = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"owner"`
 */
export const useReadTokenSaleOwner = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadTokenSaleSymbol = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadTokenSaleTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: tokenSaleAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenSaleAbi}__
 */
export const useWriteTokenSale = /*#__PURE__*/ createUseWriteContract({
  abi: tokenSaleAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"buyTokens"`
 */
export const useWriteTokenSaleBuyTokens = /*#__PURE__*/ createUseWriteContract({
  abi: tokenSaleAbi,
  functionName: 'buyTokens',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"withdrawRemainingTokens"`
 */
export const useWriteTokenSaleWithdrawRemainingTokens =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenSaleAbi,
    functionName: 'withdrawRemainingTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenSaleAbi}__
 */
export const useSimulateTokenSale = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenSaleAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"buyTokens"`
 */
export const useSimulateTokenSaleBuyTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenSaleAbi,
    functionName: 'buyTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenSaleAbi}__ and `functionName` set to `"withdrawRemainingTokens"`
 */
export const useSimulateTokenSaleWithdrawRemainingTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenSaleAbi,
    functionName: 'withdrawRemainingTokens',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenSaleAbi}__
 */
export const useWatchTokenSaleEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: tokenSaleAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenSaleAbi}__ and `eventName` set to `"TokensPurchased"`
 */
export const useWatchTokenSaleTokensPurchasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenSaleAbi,
    eventName: 'TokensPurchased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenSaleAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchTokenSaleTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenSaleAbi,
    eventName: 'Transfer',
  })
