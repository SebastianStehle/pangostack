import { useQuery } from '@tanstack/react-query';
import { ChangeEventData } from '@yaireo/tagify';
import Tags from '@yaireo/tagify/dist/react.tagify';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useController } from 'react-hook-form';
import { useApi } from 'src/api';
import { useEventCallback } from 'src/hooks';

export interface UserGroupTagsProps {
  // The form name.
  name: string;
}

export function UserGroupTags(props: UserGroupTagsProps) {
  const { name } = props;

  const api = useApi();

  const { data: loadedGroups } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => api.users.getUserGroups(),
  });

  const { field } = useController({ name });

  const doChange = useEventCallback((event: CustomEvent<ChangeEventData<any>>) => {
    const values: any[] = JSON.parse(event.detail.value || '[]');

    field.onChange(values.map((x) => x.value));
  });

  const whitelist = useMemo(() => {
    return loadedGroups?.items?.map((u) => ({ value: u.id, label: u.name })) || [];
  }, [loadedGroups?.items]);

  const value = useMemo(() => {
    return (field.value as string[]) || [];
  }, [field.value]);

  const values = useMemo(() => {
    return whitelist.filter((x) => value.indexOf(x.value) >= 0);
  }, [value, whitelist]);

  return (
    <>
      <Tags
        className={classNames('tags input input-bordered w-full')}
        onBlur={field.onBlur}
        onChange={doChange}
        settings={{
          dropdown: {
            mapValueTo: 'label',
            sortby: undefined,
            searchKeys: ['label'],
          },
          tagTextProp: 'label',
        }}
        value={values}
        whitelist={whitelist}
      />
    </>
  );
}
