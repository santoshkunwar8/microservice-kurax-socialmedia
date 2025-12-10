// Shared Types for KuraXX Chat Application
// ============= Room Types =============
export var RoomType;
(function (RoomType) {
    RoomType["DIRECT"] = "DIRECT";
    RoomType["GROUP"] = "GROUP";
    RoomType["CHANNEL"] = "CHANNEL";
})(RoomType || (RoomType = {}));
export var RoomRole;
(function (RoomRole) {
    RoomRole["OWNER"] = "OWNER";
    RoomRole["ADMIN"] = "ADMIN";
    RoomRole["MEMBER"] = "MEMBER";
})(RoomRole || (RoomRole = {}));
// ============= Message Types =============
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["FILE"] = "FILE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (MessageType = {}));
export var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENDING"] = "SENDING";
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
    MessageStatus["FAILED"] = "FAILED";
})(MessageStatus || (MessageStatus = {}));
// ============= WebSocket Types =============
export var WSEventType;
(function (WSEventType) {
    // Connection events
    WSEventType["CONNECT"] = "connect";
    WSEventType["DISCONNECT"] = "disconnect";
    WSEventType["ERROR"] = "error";
    WSEventType["AUTHENTICATE"] = "authenticate";
    WSEventType["AUTHENTICATED"] = "authenticated";
    // Message events
    WSEventType["MESSAGE_NEW"] = "message:new";
    WSEventType["MESSAGE_SAVED"] = "message:saved";
    WSEventType["MESSAGE_UPDATE"] = "message:update";
    WSEventType["MESSAGE_DELETE"] = "message:delete";
    // Presence events
    WSEventType["PRESENCE_ONLINE"] = "presence:online";
    WSEventType["PRESENCE_OFFLINE"] = "presence:offline";
    WSEventType["PRESENCE_SYNC"] = "presence:sync";
    // Typing events
    WSEventType["TYPING_START"] = "typing:start";
    WSEventType["TYPING_STOP"] = "typing:stop";
    // Room events
    WSEventType["ROOM_JOIN"] = "room:join";
    WSEventType["ROOM_LEAVE"] = "room:leave";
    WSEventType["ROOM_UPDATE"] = "room:update";
})(WSEventType || (WSEventType = {}));
//# sourceMappingURL=index.js.map