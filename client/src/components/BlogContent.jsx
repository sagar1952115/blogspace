const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt="" />
      {caption.length ? (
        <p className="w-full my-3 text-base text-center md:mb-12 text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="p-3 pl-5 border-l-4 bg-purple/10 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className="w-full text-base text-purple">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <ol
      className={`${style == "ordered" ? "list-decimal" : "list-disc"} pl-5 `}
    >
      {items.map((item, i) => {
        return (
          <li
            key={i}
            className="my-4"
            dangerouslySetInnerHTML={{ __html: item }}
          ></li>
        );
      })}
    </ol>
  );
};

const BlogContent = ({ block }) => {
  let { type, data } = block;

  if (type == "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }
  if (type == "header") {
    if (data.level == 3) {
      return <h3 dangerouslySetInnerHTML={{ __html: data.text }}></h3>;
    }
    return <h2 dangerouslySetInnerHTML={{ __html: data.text }}></h2>;
  }
  if (type == "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }
  if (type == "quote") {
    return <Quote caption={data.caption} quote={data.text} />;
  }
  if (type == "list") {
    return <List style={data.style} items={data.items} />;
  }
};

export default BlogContent;
