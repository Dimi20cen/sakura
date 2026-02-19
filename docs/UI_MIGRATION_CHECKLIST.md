# UI Migration Checklist

This checklist tracks completion of the in-game UI architecture migration to:

- transport layer
- protocol adapter
- command layer
- Redux Toolkit state ownership
- Pixi renderer boundary

## Completed

- RTK store + React-Redux provider wired (`ui/src/store`, `ui/pages/_app.tsx`)
- Lobby session migrated to transport/adapter/store (`ui/hooks/lobbySession.ts`)
- Game session migrated to transport/adapter/store (`ui/hooks/gameSession.ts`)
- Inbound game message handling migrated to runtime handler (`ui/src/store/gameRuntime.ts`)
- Legacy game message switch removed from `ui/src/ws.ts`
- Legacy `useSocket` hook removed (`ui/hooks/socket.ts`)

## Manual Regression

- [ ] Create lobby
- [ ] Join lobby with second profile
- [ ] Change settings as host (mode/map/max players/discard/victory points/speed)
- [ ] Toggle ready state for all players
- [ ] Add bot as host
- [ ] Start game
- [ ] Verify board init render (tiles/ports/placements)
- [ ] Roll dice and verify visuals/flash
- [ ] Build road/settlement/city
- [ ] Trigger action prompts and resolve/cancel
- [ ] Send chat messages in lobby and in game
- [ ] Open and resolve trade offer flow
- [ ] End turn and verify next-player state
- [ ] Validate spectator list updates
- [ ] Validate disconnect/error window behavior

## Follow-ups

- Add automated tests for:
  - protocol adapter event mapping
  - gameRuntime message handling dispatch expectations
- Reduce remaining imperative global state in `ui/src/state.ts`, `ui/src/actions.ts`, `ui/src/trade.ts` by moving behavioral ownership into reducer-driven orchestration.
