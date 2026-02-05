from sqlalchemy.orm import Session
from app.models.models import Visit, URL
from app.core.logging import logger
from user_agents import parse
import geoip2.database
from datetime import datetime

# NOTA: Para detecção de país funcionar, você precisa do banco de dados GeoLite2. 
# Como não podemos baixar facilmente aqui, vamos simular ou usar um placeholder se faltar.

def track_visit(db: Session, url_key: str, user_agent: str, ip_address: str):
    """
    Tarefa em segundo plano para processar estatísticas de visita.
    """
    try:
        url_entry = db.query(URL).filter(URL.key == url_key).first()
        if not url_entry:
            return

        # Interpretar User Agent
        ua = parse(user_agent)
        browser = f"{ua.browser.family} {ua.browser.version_string}"
        os = f"{ua.os.family} {ua.os.version_string}"
        
        # Localização Simples/Simulada (Implementação real precisa do arquivo MaxMind DB)
        country = "Desconhecido" 
        # Integração com GeoIP iria aqui:
        # reader = geoip2.database.Reader('GeoLite2-City.mmdb') ...

        visit = Visit(
            url_id=url_entry.id,
            timestamp=datetime.utcnow(),
            browser=browser,
            os=os,
            country=country
        )
        db.add(visit)
        
        # Atualizar cliques agregados na tabela principal também (opcional, mas bom para acesso rápido)
        url_entry.clicks += 1
        db.commit()
        
        logger.info(f"Visita registrada para {url_key} de {browser} / {os}")

    except Exception as e:
        logger.error(f"Erro ao registrar visita para {url_key}: {e}")
