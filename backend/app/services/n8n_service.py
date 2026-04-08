import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from app.config import settings


class N8NService:
    """Сервис для взаимодействия с n8n workflows."""
    
    def __init__(self):
        self.webhook_url = settings.N8N_WEBHOOK_URL
        self.api_key = settings.N8N_API_KEY
    
    async def trigger_workflow(
        self,
        workflow_name: str,
        data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Запустить n8n workflow.
        
        Args:
            workflow_name: Имя workflow (document-generator, contract-reviewer, etc.)
            data: Данные для обработки
            user_id: ID пользователя
        
        Returns:
            Результат выполнения workflow
        """
        webhook_url = f"{self.webhook_url}/{workflow_name}"
        
        payload = {
            "user_id": user_id,
            "data": data,
        }
        
        headers = {
            "Content-Type": "application/json",
        }
        
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    webhook_url,
                    json=payload,
                    headers=headers,
                )
                
                if response.status_code not in [200, 201, 202]:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Ошибка n8n workflow: {response.text}",
                    )
                
                return response.json()
        
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Превышено время ожидания ответа от n8n",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ошибка подключения к n8n: {str(e)}",
            )
    
    async def trigger_document_generator(
        self,
        document_type: str,
        data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """Сгенерировать документ через n8n."""
        return await self.trigger_workflow(
            workflow_name="document-generator",
            data={
                "document_type": document_type,
                "input_data": data,
            },
            user_id=user_id,
        )
    
    async def trigger_contract_review(
        self,
        extracted_text: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """Проверить договор через n8n."""
        return await self.trigger_workflow(
            workflow_name="contract-reviewer",
            data={
                "extracted_text": extracted_text,
            },
            user_id=user_id,
        )


# Singleton instance
n8n_service = N8NService()

