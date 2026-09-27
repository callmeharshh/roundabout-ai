export type RoomMember = {
  id: string;
  name: string;
  isHost?: boolean;
  connectedAt: string;
};

export type RoomSession = {
  roomCode: string;
  hostId: string;
  members: RoomMember[];
  createdAt: string;
  status: 'waiting' | 'playing';
  currentPlayerId: string;
};

export function createRoomSession(hostName: string): RoomSession {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const hostId = `host-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    roomCode: code,
    hostId,
    members: [{
      id: hostId,
      name: hostName,
      isHost: true,
      connectedAt: now,
    }],
    createdAt: now,
    status: 'waiting',
    currentPlayerId: hostId,
  };
}

export function addMemberToRoom(room: RoomSession, name: string): RoomSession {
  if (room.members.length >= 8) return room;

  const memberId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...room,
    members: [...room.members, {
      id: memberId,
      name,
      connectedAt: new Date().toISOString(),
    }],
  };
}
