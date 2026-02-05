import logging
import sys

def setup_logging():
    logger = logging.getLogger("url_shortener")
    logger.setLevel(logging.INFO)

    # Handler de Console
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    
    # Formatador
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)

    # Evitar handlers duplicados
    if not logger.handlers:
        logger.addHandler(handler)

    return logger

logger = setup_logging()
