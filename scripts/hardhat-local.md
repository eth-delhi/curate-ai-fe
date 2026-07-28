# Local Hardhat dev (with Magic wallet)

Magic executes RPC calls inside its `auth.magic.link` iframe, whose CSP refuses
`http://127.0.0.1:8545`. Workaround: expose the node over https with a
Cloudflare quick tunnel and point the app at it via `NEXT_PUBLIC_RPC_URL`.

## Per-session setup

1. **Start the node** (in the contracts repo) and deploy:
   ```sh
   npx hardhat node
   npx hardhat run scripts/deploy.ts --network localhost
   ```
   Deterministic deploy addresses live in `constants/contract.ts` — update them
   if the deploy order/nonces change.

2. **Start the tunnel** and copy the https URL it prints:
   ```sh
   cloudflared tunnel --url http://127.0.0.1:8545
   ```

3. **Update `.env`**: set `NEXT_PUBLIC_RPC_URL` to the tunnel URL
   (it changes on every tunnel restart), make sure
   `NEXT_PUBLIC_BLOCKCHAIN_NETWORK=hardhat-local`, then restart `next dev`
   (NEXT_PUBLIC vars are inlined at build time).

4. **Fund your Magic wallet** (fresh nodes give it 0 ETH). Get your address
   from the app, then:
   ```sh
   curl -X POST http://127.0.0.1:8545 -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"hardhat_setBalance","params":["<YOUR_MAGIC_ADDRESS>","0x8AC7230489E80000"]}'
   ```
   (`0x8AC7230489E80000` = 10 ETH.)

## Time travel

Jump the chain forward to test 24h vote windows / daily settlement:

```sh
./scripts/time-travel.sh          # +24 hours
./scripts/time-travel.sh 3600    # +1 hour
```

Runs `evm_increaseTime` + `evm_mine` against `RPC_URL` (default
`http://127.0.0.1:8545` — no tunnel needed since it runs on your machine).
