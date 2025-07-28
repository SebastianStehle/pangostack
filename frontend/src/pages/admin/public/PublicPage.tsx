import { ProfileButton, TransientNavLink } from 'src/components';
import { useTheme } from 'src/hooks';

export function PublicPage() {
  const { theme } = useTheme();

  return (
    <div>
      <div className="h-50 flex justify-between bg-header">
        <div className="container mx-auto flex max-w-[1000px] justify-between px-4 py-4">
          <TransientNavLink to="/" className="btn btn-link no-underline! text-2xl text-primary-content">
            {theme.name}
          </TransientNavLink>

          <div>
            <ProfileButton menuPlacement="bottom-end" style="avatar" />
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-10 max-w-[1000px] px-4">
        <div className="card-body rounded-lg bg-white shadow-xl">
          <h2 className="card-title">Card Title</h2>
          <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
