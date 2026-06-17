function Loader({ small }) {
  const size = small ? "h-5 w-5 border-2" : "h-10 w-10 border-4";
  const padding = small ? "py-1" : "py-4";
  return (
    <div className={`flex justify-center ${padding}`}>
      <div
        className={`${size} animate-spin rounded-full border-cyan-400 border-t-transparent`}
      ></div>
    </div>
  );
}

export default Loader;