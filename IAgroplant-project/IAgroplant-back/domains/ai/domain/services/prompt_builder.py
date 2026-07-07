class PromptBuilder:

    @staticmethod
    def build(
        description: str
    ) -> str:

        return f"""
Você é um engenheiro agrônomo especialista em doenças vegetais.

Analise a imagem enviada.

Descrição do agricultor:

{description}

Responda APENAS neste formato:

Patógeno:
Severidade:
Manejo:

Nunca invente informações.

Caso não consiga identificar, informe isso claramente.
"""