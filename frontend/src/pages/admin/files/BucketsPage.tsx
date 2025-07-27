import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BucketDto, useApi } from 'src/api';
import { Icon, Page } from 'src/components';
import { useEventCallback, useTransientNavigate } from 'src/hooks';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { Bucket } from './Bucket';
import { CreateBucketDialog } from './CreateBucketDialog';
import { EmptyPage } from './EmptyPage';
import { FilesPage } from './FilesPage';
import { UpdateBucketDialog } from './UpdateBucketDialog';
import { useBucketstore } from './state';

export function BucketsPage() {
  const api = useApi();

  const navigate = useTransientNavigate();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<BucketDto | null>(null);
  const { buckets, removeBucket, setBucket, setBuckets } = useBucketstore();

  const { data: loadedBuckets, isFetched } = useQuery({
    queryKey: ['buckets'],
    queryFn: () => api.files.getBuckets(),
  });

  useEffect(() => {
    if (loadedBuckets) {
      setBuckets(loadedBuckets.items);
    }
  }, [loadedBuckets, setBuckets]);

  const deleting = useMutation({
    mutationFn: (bucket: BucketDto) => {
      return api.files.deleteBucket(bucket.id);
    },
    onSuccess: (_, bucket) => {
      removeBucket(bucket.id);
      navigate('/admin/files/');
    },
    onError: async (error) => {
      toast.error(await buildError(texts.files.removeBucketFailed, error));
    },
  });

  const doCreate = useEventCallback((bucket: BucketDto) => {
    setBucket(bucket);
    navigate(`/admin/files/${bucket.id}`);
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });
  return (
    <Page
      menu={
        <div className="flex flex-col overflow-y-hidden">
          <div className="flex p-8 pb-4">
            <h3 className="grow text-xl">{texts.files.buckets}</h3>

            <button className="btn btn-square btn-success btn-sm text-sm text-white" onClick={() => setToCreate(true)}>
              <Icon icon="plus" size={16} />
            </button>
          </div>

          <div className="grow overflow-y-auto p-8 pt-4">
            <ul className="nav-menu nav-menu-dotted">
              {buckets.map((bucket) => (
                <Bucket key={bucket.id} bucket={bucket} onDelete={deleting.mutate} onUpdate={setToUpdate} />
              ))}
            </ul>

            {buckets.length === 0 && isFetched && <div className="pt-4 text-sm text-gray-400">{texts.files.bucketsEmpty}</div>}
          </div>
        </div>
      }
    >
      <Routes>
        <Route path=":id" element={<FilesPage />} />
        <Route path="" element={<EmptyPage />} />
      </Routes>

      {toCreate && <CreateBucketDialog onClose={doClose} onCreate={doCreate} />}
      {toUpdate && <UpdateBucketDialog onClose={doClose} onUpdate={setBucket} target={toUpdate} />}
    </Page>
  );
}
