from dotenv import load_dotenv
import os
import json

load_dotenv()

def create_fbs_prv_key():
    svc_account_credentials = {
        "type": os.environ.get('FBS_SVC_ACCOUNT'),
        "project_id": os.environ.get('FBS_SVC_PROJECT_ID'),
        "private_key_id": os.environ.get('FBS_SVC_PRIVATE_KEY_ID'),
        "private_key": os.environ.get('FBS_SVC_PRIVATE_KEY'),
        "client_email": os.environ.get('FBS_SVC_CLIENT_EMAIL'),
        "client_id": os.environ.get('FBS_SVC_CLIENT_ID'),
        "auth_uri": os.environ.get('FBS_SVC_AUTH_URI'),
        "token_uri": os.environ.get('FBS_SVC_TOKEN_URI'),
        "auth_provider_x509_cert_url": os.environ.get('FBS_SVC_AUTH_PROV'),
        "client_x509_cert_url": os.environ.get('FBS_SVC_CLIENT_CERT_URL')
    }

    with open('tiktaktoe-private-key.json', 'w') as file_obj:
        json.dump(svc_account_credentials, file_obj, ensure_ascii=True, indent=2)
