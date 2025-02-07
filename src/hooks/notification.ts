import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

type NotificationLevel = 'info' | 'error' | 'warning';
export function useNotifications() {
  const $q = useQuasar();
  const locale = useI18n();

  const colors: { [key in NotificationLevel]: string } = {
    info: null,
    error: 'red',
    warning: 'yellow',
  };

  const notify = (
    message: string,
    group = true,
    level: NotificationLevel = 'info'
  ) => {
    $q.notify({
      group,
      color: colors[level],
      message,
      position: $q.platform.is.mobile ? 'bottom' : 'bottom-right',
      closeBtn: locale.t('close'),
    });
  };

  return {
    notify,
  };
}
