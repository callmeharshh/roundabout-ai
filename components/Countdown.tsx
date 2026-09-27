type CountdownProps = {
  seconds: number;
};

export function Countdown({ seconds }: CountdownProps) {
  return <div className="countdown-box">{seconds}</div>;
}
