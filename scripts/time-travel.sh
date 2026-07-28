#!/usr/bin/env bash
# Advance the local hardhat node's clock and mine a block.
#
#   ./scripts/time-travel.sh            # +24 hours (default)
#   ./scripts/time-travel.sh 3600       # +1 hour
#   RPC_URL=https://... ./scripts/time-travel.sh 86400
set -euo pipefail

SECONDS_TO_ADD="${1:-86400}"
RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"

rpc() {
  curl -s -X POST "$RPC_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$1\",\"params\":$2}"
}

echo "Increasing time by ${SECONDS_TO_ADD}s on ${RPC_URL}"
rpc evm_increaseTime "[${SECONDS_TO_ADD}]" > /dev/null
rpc evm_mine "[]" > /dev/null

TS_HEX=$(rpc eth_getBlockByNumber '["latest", false]' | sed -n 's/.*"timestamp":"\(0x[0-9a-f]*\)".*/\1/p')
echo "Done. Latest block timestamp: $(date -r $((TS_HEX)) 2>/dev/null || echo $((TS_HEX)))"
