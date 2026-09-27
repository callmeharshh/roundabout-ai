type ChaosModeBannerProps = {
  active?: boolean;
};

export function ChaosModeBanner({ active = true }: ChaosModeBannerProps) {
  return (
    <div className="banner-box">
      <strong>{active ? 'Chaos mode: live' : 'Chaos mode: cooling down'}</strong>
      <span>{active ? 'No one is safe' : 'Still wildly entertaining'}</span>
    </div>
  );
}
