"""passbook auth oauth provider app config"""

from django.apps import AppConfig


class PassbookOAuthProviderConfig(AppConfig):
    """passbook auth oauth provider app config"""

    name = 'passbook.oauth_provider'
    label = 'passbook_oauth_provider'
    verbose_name = 'passbook OAuth Provider'
    mountpoint = 'application/oauth/'
