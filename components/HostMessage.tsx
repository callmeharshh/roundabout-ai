type HostMessageProps = {
  message: string;
};

export function HostMessage({ message }: HostMessageProps) {
  return (
    <div className="host-message">
      <strong>Host message</strong>
      <div>{message}</div>
    </div>
  );
}
