
import os
import httpx

BASE_URL = "https://openapi.sosovalue.com/openapi/v1"


class SoSoValueClient:
    def __init__(self):
        self.api_key = os.environ["SOSOVALUE_API_KEY"]

    async def get(self, path, params=None):
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{BASE_URL}{path}",
                headers={
                    "x-soso-api-key": self.api_key
                },
                params=params,
            )

            response.raise_for_status()
            payload = response.json()

            if payload.get("code") != 0:
                raise ValueError(
                    payload.get("message", "API request failed")
                )

            return payload["data"]

    async def get_currencies(self):
        return await self.get("/currencies")

    async def get_candles(self, currency_id):
        return await self.get(
            f"/currencies/{currency_id}/klines",
            params={"interval": "1d", "limit": 90},
        )

    async def get_indices(self):
        return await self.get("/indices")

    async def get_index_candles(self, ticker):
        return await self.get(
            f"/indices/{ticker}/klines",
            params={"interval": "1d", "limit": 90},
        )
