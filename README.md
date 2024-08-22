## Description

This is my Nest.js chat room with websockets. This chat have only one chat room and user can connect to it without authorization.
To run this project, copy it from GitHub with:
```
git clone
```
To run this project:
```
docker-compose up
```

To connect to this chat room, user need to specify his username in Params with "username" as a key and his username as value.

## WebSocket Events

### Events

- error: Triggered in case of any errors.
- users_list: Sends the current list of users connected to the chat room.
- user_connected: Sends information about a user who has connected to the chat room.
- user_disconnected: Sends information about a user who has left the chat room.
- new_message: Sends information about a new message posted in the chat room.
- edited_message: Sends information about a message that has been edited.
- deleted_message: Sends information about a message that has been deleted.

### Sending Messages

- send_message  
  Payload: { "text": "<message text>" }  
  Description: Sends a message to all users in the chat room.
  
- edit_message  
  Payload: { "messageId": "<message id>", "text": "<new text>" }  
  Description: Edits a message by its ID and notifies all users in the chat room.
  
- delete_message  
  Payload: { "messageId": "<message id>" }  
  Description: Deletes a message by its ID and notifies all users in the chat room.