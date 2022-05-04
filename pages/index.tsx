import React from "react";
function Button(props: { title: string; href: string, className?: string }) {
  return (
    <a
      href={props.href}
      className={`hover:bg-gray-800 hover:font-semibold hover:text-white m-auto rounded-xl font-bold py-3 px-2 text-center decoration-none w-44 border-2 border-solid border-black ${props.className}`}
    >
      {props.title}
    </a>
  );
}
function Item(props: {
  title: string;
  body: string;
  button_text: string;
  button_href: string;
  image_src: string;
  reverse?: boolean;
}) {

  return (
    <div className={`my-3 p-2 flex flex-col md:flex-row  max-w-6xl mx-auto`}>
      {/* {props.reverse && (
        <img className="" src={props.image_src} />
      )} */}
      <div className="flex justify-evenly flex-col m-2">
        <h2 className="text-3xl my-auto text-center font-bold">{props.title}</h2>
        <p className="text-xl p-2 m-2 my-auto">{props.body}</p>
        <Button className="my-auto" href={props.button_href} title={props.button_text} />
      </div>
      <img
        className="rounded-md max-h-[400px] m-4 object-cover"
        src={props.image_src}
      />
    </div>
  );
}
function Home(props) {
  return (
    <div className="flex flex-col">
      <div className="grid h-[60vh] lg:mx-40 lg:grid-cols-[1fr_1fr] md:grid-cols-[1fr] grid-rows-1">
        <img
          src="/images/home-imgs/network.svg"
          className="object-cover h-full lg:p-20 m-auto"
          alt="Sarafu Network"
        />
        <div className="flex flex-col justify-center items-center">
          <p className="text-4xl text-center max-w-sm mt-auto">
            Prospering economies built by thriving communities
          </p>
          <img className="m-auto h-1/3" src="/images/home-imgs/home-logo-2.svg" />
        </div>
      </div>
      <Item
        title="Ending poverty lies in building communities"
        body="Through Community Inclusion Currencies people have a way to exchange
            goods and services and incubate projects and businesses, without
            relying on scarce national currency and volatile markets."
        button_href="/how-it-works"
        button_text="How it Works"
        image_src="/images/home-imgs/home-img2.webp"
      />
      <Item
        title="We envision prospering economies built by thriving communities"
        body="Grassroots Economics is a non-profit foundation that has been
        seeking to empower marginalized communities to take charge of
        their own livelihoods and economic future since 2010."
        button_href="/about-us"
        button_text="About us"
        image_src="/images/home-imgs/home-img3.webp"
        reverse={true}
      />
      <Item
        title="Get involved"
        body="Communities should be afforded the same privileges as nations and
        be empowered to develop their own prospering economies with the
        stability of their own currencies."
        button_href="/get-involved"
        button_text="Support us"
        image_src="/images/home-imgs/home-img4.webp"
      />

      <div className="flex  flex-col">
        <div className="flex justify-center text-lg">
          <a href="/media">As featured in media</a>
        </div>
        <div className="flex justify-center items-center">
          <a
            className="p-1"
            href="https://qz.com/86618/introducing-the-bangla-pesa-kenyas-beautiful-new-complementary-currency/"
          >
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/quartz.webp"
            />
          </a>
          <a className="p-1" href="https://www.youtube.com/watch?v=1awCx-eJB0I">
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/ktb.webp"
            />
          </a>
          <a
            className="p-1"
            href="https://www.bloomberg.com/news/features/2018-10-31/closing-the-cash-gap-with-cryptocurrency"
          >
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/bloomberg.webp"
            />
          </a>
          <a className="p-1" href="http://bbc.co.uk/programmes/p05zw020">
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/bbc.webp"
            />
          </a>
          <a className="p-1" href="https://www.youtube.com/watch?v=UpCr8-3K05E">
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/aljazeera.webp"
            />
          </a>
          <a
            className="p-1"
            href="http://www.yesmagazine.org/commonomics/alternative-currencies-bigger-than-bitcoin-bangla-pesa-brixton"
          >
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/yes.webp"
            />
          </a>
          <a
            className="p-1"
            href="https://vimeo.com/album/2637039/video/84658423"
          >
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/afd.webp"
            />
          </a>
          <a
            className="p-1"
            href="https://www.huffingtonpost.com/ellen-brown/the-crime-of-alleviating-_b_3519858"
          >
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/huffpost.webp"
            />
          </a>
          <a className="p-1" href="https://www.kateraworth.com/doughnut/">
            <img
              className="max-w-full h-auto"
              src="/images/home-imgs/doughnut.webp"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
export default Home;
