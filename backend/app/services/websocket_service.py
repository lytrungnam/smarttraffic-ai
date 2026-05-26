from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.active_connections = []

    async def connect(
        self,
        websocket: WebSocket,
    ):

        await websocket.accept()

        self.active_connections.append(
            websocket
        )

    def disconnect(
        self,
        websocket: WebSocket,
    ):

        self.active_connections.remove(
            websocket
        )

    async def broadcast(
        self,
        data,
    ):

        disconnected = []

        for connection in self.active_connections:

            try:

                await connection.send_json(
                    data
                )

            except Exception:

                disconnected.append(
                    connection
                )

        for connection in disconnected:

            self.disconnect(
                connection
            )


manager = ConnectionManager()