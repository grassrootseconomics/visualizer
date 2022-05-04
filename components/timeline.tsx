export const Timeline = ({
  items,
}: {
  items: { body: JSX.Element; title: string; date: string }[];
}) => {
  return (
    // <!-- This is an example component -->

    <div className="min-h-screen">
      <div className="min-h-screen flex justify-center">
        <div className="w-3/3 mx-auto">
          {items.map((item, index) => {
            return (
              <TimelineItem
                date={item.date}
                body={item.body}
                title={item.title}
                position={index % 2 === 0 ? "left" : "right"}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TimelineBody = ({ title, body }) => {
  return (
    <div className="flex flex-col bg-slate-200 w-full rounded-lg shadow px-4 py-5">
      <div className="text-gray-600 mb-2 flex justify-between">
        <div className="font-bold">{title}</div>
      </div>
      <div className="text-gray-600">{body}</div>
    </div>
  );
};
const TimelineDate = ({ date }) => (
  <div className="dark:text-black relative flex h-full w-1 bg-green-300 items-center justify-center">
    <div className="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin">
      <div>{date}</div>
    </div>
  </div>
);
const TimelineItem = ({ title, body, date, position }) => {
  if (position === "left") {
    return (
      <div className="flex flex-row w-full">
        <div className="w-[47%] px-5 py-10">
          <TimelineBody title={title} body={body} />
        </div>
        <div className="w-[6%]  flex justify-center">
          <TimelineDate date={date} />
        </div>
        <div className="w-[47%] px-5 py-10 "></div>
      </div>
    );
  } else if (position === "right") {
    return (
      <div className="flex flex-row w-full">
        <div className="w-[45%] px-5 py-10"></div>
        <div className="w-[10%]  flex justify-center">
          <TimelineDate date={date} />
        </div>
        <div className="w-[45%] px-5 py-10 ">
          <TimelineBody title={title} body={body} />
        </div>
      </div>
    );
  } else {
    // Mobile
    return (
      <div className="flex flex-row w-full">
        <div className="w-1/12  flex justify-center">
          <TimelineDate date={date}/>
        </div>
        <div className="w-4/12 px-2 py-10 ">
          <TimelineBody title={title} body={body} />
        </div>
      </div>
    );
  }
};
