import React from "react";
function Page() {
  return (
    <div className="container mx-auto sm:px-4 max-w-full">
      <div className="img-text-container">
        <img
          className="max-w-full h-auto"
          src="/images/howitworks-imgs/howit-img1.webp"
        />
        <h1 className="text-img">Community Inclusion Currencies</h1>
      </div>

      <div className="iframe-wrapper">
        <div className="iframe-container1">
          <iframe
            height="515"
            width={"100%"}
            src="https://www.youtube.com/embed/vJL9-FFleow"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className="many-imgs">
        <div className="flex flex-wrap ">
          <div className="w-1/2">
            <img
              className="max-w-full h-auto img-extend"
              src="/images/howitworks-imgs/manyimgs1resized.gif"
            />
          </div>
          <div className="w-1/2 mt-auto">
            <p className="text-beside1 word-wrap">
              Community Inclusion Currencies are regional means of exchange that
              supplements the national currency system. See Sarafu Network as an
              example.
            </p>
            <br />
            <div className=" arrow-container">
              <div className="bottom">
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/manyimgs-2.webp"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap flex-row-reverse">
          {/* <!--            first item is left most item on the page order has been reversed with flex-row-reverse--> */}
          <div className="w-1/2">
            <div className="center-this">
              <img
                className="max-w-full h-auto handmaid-img"
                src="/images/howitworks-imgs/manyimgs-3.webp"
              />

              <p className="word-wrap2">
                Due to economic instability, people often lack money with which
                to purchase from each other
              </p>
            </div>
          </div>
          <div className="w-1/2">
            <img
              className="max-w-full h-auto rotate-up"
              src="/images/howitworks-imgs/manyimgs-2.webp"
            />
            <img
              className="max-w-full h-auto tree-img"
              src="/images/howitworks-imgs/manyimgs-8.webp"
            />
            <p className="word-wrap2">
              Thriving communities build their own prospering economies
            </p>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-1/2 center-this">
            <img
              className="max-w-full h-auto rotate-up-side"
              src="/images/howitworks-imgs/manyimgs-2.webp"
            />
          </div>

          <div className="w-1/2 ">
            <img
              className="max-w-full h-auto rotate-down-side"
              src="/images/howitworks-imgs/manyimgs-2.webp"
            />
          </div>
        </div>
        <div className="flex flex-wrap ">
          <div className="w-full center-this">
            <div className="last-content-box">
              <img
                className="max-w-full h-auto"
                src="/images/howitworks-imgs/manyimgs-5.webp"
              />
              <p className="word-wrap">
                Community currencies create a stable medium of exchange tied to
                local development
              </p>
            </div>
          </div>
        </div>
        <div className=" flex buttons-at-end justify-center">
          <a className="buttons-end" href="/pages/how-it-works.html">
            Our model
          </a>
          <a className="buttons-end" href="/pages/research.html">
            Impacts
          </a>
        </div>
      </div>
      <div className="image-span-over">
        <img
          className="max-w-full h-auto img-full"
          src="/images/howitworks-imgs/cic-training1.webp"
        />
      </div>
      <div className="community-wrap">
        <div className="center-this">
          <h2 className="community-text">
            Community Inclusion Currencies (CICs) connect
          </h2>
        </div>
        <div className="flex flex-wrap ">
          <div className="w-1/3">
            <div className="center-this">
              <img
                className="max-w-full h-auto round-this"
                src="/images/howitworks-imgs/round-img1.webp"
              />
              <p className="workforces">Underutilized workforces</p>
            </div>
          </div>
          <div className="w-1/3">
            <div className="center-this">
              <i className="fas fa-plus fa-5x margin-plus"></i>
            </div>
          </div>
          <div className="w-1/3">
            <div className="center-this">
              <img
                className="max-w-full h-auto round-this"
                src="/images/howitworks-imgs/round-img2.webp"
              />
              <p className="workforces">Underutilized resources</p>
            </div>
          </div>
        </div>
        <div className="center-this">
          <div className="word-box">
            <p className="increase-font">
              to local markets and capital reserves that guarantee the provision
              of basic needs
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="cuteimg-container">
            <img
              className="max-w-full h-auto cute-imgs"
              src="/images/howitworks-imgs/cartimg.gif"
            />
          </div>
          <div className="cuteimg-container">
            <img
              className="max-w-full h-auto cute-imgs"
              src="/images/howitworks-imgs/house-img.gif"
            />
          </div>
          <div className="cuteimg-container">
            <img
              className="max-w-full h-auto cute-imgs"
              src="/images/howitworks-imgs/foodimg.gif"
            />
          </div>
        </div>
      </div>
      <div className="image-span-over">
        <img
          className="max-w-full h-auto img-full"
          src="/images/howitworks-imgs/bangla-pesa-launch1.webp"
        />
      </div>
      <div className="long-drawings-wrap">
        <div className="flex flex-wrap  justify-center">
          <div className="w-1/3">
            {/* <!--                <div className="img-cont">--> */}
            <img
              className="max-w-full h-auto img-small-media"
              src="/images/howitworks-imgs/drawing1.webp"
            />
            {/* <!--                </div>--> */}
          </div>
          <div className="w-1/3">
            <p className="text-img-font center-this">
              Investments and donations provide funding and liquidity for CICs
              to develop local industries and infrastructure
            </p>
          </div>
        </div>
        <div className="flex flex-wrap  justify-center">
          <div className="w-1/3 center-this">
            <img
              className="max-w-full h-auto rotate-torch"
              src="/images/howitworks-imgs/long-torch.gif"
            />
          </div>
          <div className="w-1/3">
            <div className="font-box">
              <p className="diff-font center-this">
                These industries act as backers for the community currencies
                that are issued into the region through interest-free credit,
                community services and operational costs
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap  justify-center">
          <div className="w-1/3">
            <img
              className="max-w-full h-auto img-extend"
              src="/images/howitworks-imgs/manyimgs1resized.gif"
            />
          </div>
          <div className="w-1/3">
            <p className="text-img-font center-this trade-padding">
              Community Inclusion Currencies accelerate trade and provide
              funding for social and environmental services
            </p>
          </div>
        </div>
        <div className="flex flex-wrap  justify-center">
          <div className="w-1/3 center-this">
            <img
              className="max-w-full h-auto rotate-torch"
              src="/images/howitworks-imgs/long-torch.gif"
            />
          </div>
          <div className="w-1/3">
            <div className="font-box">
              <p className="diff-font center-this">
                Community Inclusion Currencies provide markets and incubate
                local industries{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap  justify-center">
          <div className="w-1/3 center-this">
            <img
              className="max-w-full h-auto"
              src="/images/howitworks-imgs/home-on-globe.webp"
            />
          </div>
          <div className="w-1/3">
            <div className="font-box">
              <p className="text-img-font center-this mature-padding">
                These mature industries provide...
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap ">
          <div className="w-1/4">
            <div className="font-box">
              <p className="social-text">
                Social and financial return in investments
              </p>
            </div>
          </div>
          <div className="w-1/4 center-this">
            <img
              className=" short-torch "
              src="/images/howitworks-imgs/short-torch.gif"
            />
          </div>
          <div className="w-1/4">
            <div className="font-box">
              <p className="social-text">Social enterprise development</p>
            </div>
          </div>
        </div>
        <div className=" flex justify-end click-to-learn">
          <div className="link-box">
            <a
              className="click-style"
              href="/pages.get-involved.html"
            >
              Click here to learn more through our course
            </a>
          </div>
        </div>
      </div>
      <div className="image-span-over">
        <img
          className="max-w-full h-auto img-full"
          src="/images/howitworks-imgs/empowering-mothers1.webp"
        />
      </div>
      <div className="huge-font">
        <div className="huge-font-box">
          <h1 className="huge-font-style">
            Through our work in Kenya we've seen:
          </h1>
        </div>
      </div>
      <div className="percentages">
        <div className="flex flex-wrap ">
          <div className="relative flex-grow max-w-full flex-1 px-4 ">
            <div className="col1-color col-padding-util">
              <p className="percent-font center-this">77%</p>
              <div className="percent-below-box">
                <p className="percent-words center-this">Increase in trust</p>
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/col1-img.webp"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <div className="col2-color col-padding-util">
              <p className="percent-font center-this">347%</p>
              <div className="percent-below-box">
                <p className="percent-words center-this">Increase in gifting</p>
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/col2-imgs-removebg-preview.png"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <div className="col1-color col-padding-util">
              <p className="percent-font center-this">57%</p>
              <div className="percent-below-box">
                <p className="percent-words center-this">
                  Increase in environmental activities
                </p>
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/leafimg-removebg-preview.png"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <div className="col2-color col-padding-util">
              <p className="percent-font center-this">23%</p>
              <div className="percent-below-box">
                <p className="percent-words center-this">
                  Increase in school attendance
                </p>
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/books-carton-removebg-preview.png"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <div className="col1-color col-padding-util">
              <p className="percent-font center-this">25%</p>
              <div className="percent-below-box">
                <p className="percent-words center-this">
                  Decrease in crime and corruption
                </p>
                <img
                  className="max-w-full h-auto"
                  src="/images/howitworks-imgs/angel2-removebg-preview.png"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="more-percentages">
          <div className="flex">
            <div className="circle-container">
              <img
                className="max-w-full h-auto abs-img"
                src="/images/howitworks-imgs/17percent.webp"
              />
              <p className="text-middle">+17%</p>
              <div className="words-below-wrap">
                <p className="words-below center-this">Jobs created</p>
              </div>
            </div>
            <div className="circle-container">
              <img
                className="max-w-full h-auto abs-img"
                src="/images/howitworks-imgs/37percent.webp"
              />
              <p className="text-middle">+37%</p>
              <div className="words-below-wrap">
                <p className="words-below center-this">Sales revenue</p>
              </div>
            </div>
            <div className="circle-container">
              <img
                className="max-w-full h-auto abs-img"
                src="/images/howitworks-imgs/78percent.webp"
              />
              <p className="text-middle">+78%</p>
              <div className="words-below-wrap">
                <p className="words-below center-this">Food Security</p>
              </div>
            </div>
          </div>
        </div>
        <div className="last-link-wrap style-center">
          <a className="last-link-style" href="/pages/research.html">
            Click here to learn more about our research
          </a>
        </div>
      </div>
      <div className="container mx-auto sm:px-4 container-cic">
        <p className="center-this cic-title">
          As a socio-economic development tool Community Currency offers an
          innovative way to improve living standards
        </p>
        <div className="flex flex-wrap ">
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img1.webp"
            />
            <p>lack of money</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img2.webp"
            />
            <p>market instability</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img3.webp"
            />
            <p>lack of investment</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img4.webp"
            />
            <p>excess capital</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img5.webp"
            />
            <p>lack of local industries</p>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            className="max-w-full h-auto"
            src="/images/howitworks-imgs/arrow-down1.png"
          />
        </div>
        <div className="flex flex-wrap ">
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img6.webp"
            />
            <p>interest free credit card</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img7.webp"
            />
            <p>market stability</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img8.webp"
            />
            <p>increase in local trade</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img9.webp"
            />
            <p>build local trust and financial social services</p>
          </div>
          <div className="relative flex-grow max-w-full flex-1 px-4">
            <img
              className="cic-img-round"
              src="/images/howitworks-imgs/cic-img11.webp"
            />
            <p>increase in jobs and business development</p>
          </div>
        </div>
        <div className="going-to-scale center-this">
          <h2 className="scale-text">Going to scale</h2>
          <img className="max-w-full h-auto" src="/images/howitworks-imgs/scale.webp" />
        </div>
      </div>
      <hr className="line-span" />

      <div className="box-center box-center-padding">
        <p className="font-increase center-this">
          But this is just the beginning!
        </p>
        <p className="font-increase center-this">
          User generated Community Inclusion Currencies have the potential to
          create a world wide market for smart token social bonds and connected
          sustainable development goals
        </p>
      </div>

      <hr className="line-span" />

      <div className="small-box-center box-center-padding">
        <p className="center-this small-increase">
          We are currently working on a{" "}
          <a className="mooc-link" href="/pages/mooc.html">
            MOOC
          </a>{" "}
          to be able to spread our knowledge, findings, troubles and projections
          for the future!
        </p>
      </div>
    </div>
  );
}
export default Page;
