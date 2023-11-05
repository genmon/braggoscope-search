export default function CreateIndexButton(props: {
  isDone: boolean;
  progress: number;
  target: number;
  handleClick: () => void;
}) {
  return (
    <button
      className="relative border border-blue-500 hover:bg-blue-100 disabled:hover:bg-transparent text-blue-500 disabled:text-black/50 disabled:cursor-wait font-semibold py-2 px-6 rounded-sm"
      onClick={props.handleClick}
      disabled={!props.isDone}
    >
      <progress
        className="-z-10 absolute top-0 left-0 bottom-0 right-0 w-full h-full progress-unfilled:bg-white progress-filled:bg-blue-300"
        style={{ WebkitAppearance: "none" }}
        value={props.progress}
        max={props.target}
      />
      {props.isDone ? "Create Index" : "Working..."}
    </button>
  );
}
