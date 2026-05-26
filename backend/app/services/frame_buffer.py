import asyncio

latest_frame: bytes | None = None
frame_ready: asyncio.Event = asyncio.Event()
