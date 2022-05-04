import { Timeline } from "@components/timeline";
import React from "react";

function Person(props: {
  person: { name: string; position: string; image: string };
}) {
  return (
    <div className="p-4 gap-2 grid sm:grid-rows-1 sm:grid-cols-2  justify-center">
      <img
        className="max-w-full h-auto rounded-full"
        src={props.person.image}
      />
      <div className="text-center md:text-left flex flex-col justify-center">
        <p>
          <strong>{props.person.name}</strong>
        </p>
        <p>{props.person.position}</p>
      </div>
    </div>
  );
}
const people = [
  {
    image: "/images/aboutus-imgs/shaila.webp",
    name: "Shaila",
    position: "Director",
  },

  {
    image: "/images/aboutus-imgs/will_ruddick.webp",
    name: "Will Ruddick",
    position: "Founder",
  },

  {
    image: "/images/aboutus-imgs/damaris_njoroge.webp",
    name: "Damaris Njoroge",
    position: "Program Coordinator",
  },

  {
    image: "/images/aboutus-imgs/sylvia_karanja.webp",
    name: "Sylvia Karanja",
    position: "Data Quality Engineer",
  },

  {
    image: "/images/aboutus-imgs/amina_godana.webp",
    name: "Amina Godana",
    position: "Support Engineer",
  },

  {
    image: "/images/aboutus-imgs/janet_treezer.webp",
    name: "Janet Treezer",
    position: "Support Engineer",
  },

  {
    image: "/images/aboutus-imgs/louis_holbrook.webp",
    name: "Louis Holbrook",
    position: "Lead Software Architect ",
  },

  {
    image: "/images/aboutus-imgs/william-luke.webp",
    name: "William (Lum) Luke",
    position: "Senior Software Engineer",
  },

  {
    image: "/images/aboutus-imgs/philip_wafula.webp",
    name: "Philip Wafula",
    position: "Senior Software Engineer",
  },
  {
    image: "/images/aboutus-imgs/blair_vanderlugt.webp",
    name: "Blair Vanderlugt",
    position: "Software Team Lead",
  },

  {
    image: "/images/aboutus-imgs/mohammed_sohail.webp",
    name: "Mohammed Sohail",
    position: "Senior Software Engineer",
  },

  {
    image: "/images/aboutus-imgs/joyce_kamauk.webp",
    name: "Joyce Kamauk",
    position: "Support Engineer",
  },

  {
    image: "/images/aboutus-imgs/emmanuel_mbui.webp",
    name: "Emmanuel Mbui",
    position: "Support Engineer",
  },

  {
    image: "/images/aboutus-imgs/fransisca_achieng.webp",
    name: "Fransisca (Mami) Achieng",
    position: "Field Support Engineer",
  },
];

const timeline = [
  {
    title: "ECO_PESA",
    date: "2010",
    body: (
      <div>
        <p>
          This program was launched as a backed currency model with 75
          Businesses taking part in three informal settlements near Kongowea,
          Mombasa. The currency was backed by donor funds and accomplished some
          amazing community service and environmental goals in partnership with
          Green World Campaign while increasing local trade for a year period.
        </p>
        <div className="wrapper-carousel">
          <p className="font-big">On average profits increased in 20%</p>
          <div className="img-wrap">
            <img
              className="max-w-full h-auto leaf-style"
              src="/images/aboutus-imgs/green-leaf-temp-removebg-preview.png"
            />
          </div>
          <p className="font-big">
            20 tonnes of trash collected 1000's of trees were planted
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "BANGLA-PESA",
    date: "2012 and 2013",
    body: (
      <>
        <p>
          Bangladesh is an informal settlement of approximatly 20 000
          inhabitants located outside Mombasa Kenya. This was the first place
          where a program that was not fully dependent on donor funds was
          launched. After having had a dramatic start, with people being
          arrested under charges of forgery, this project currently holds 87,200
          (ksh equivalent) vouchers in circulation and a network of 218
          businesses.
        </p>
        <iframe
          width="480"
          height="277"
          src="https://www.youtube.com/embed/UaspBGmsdLE"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </>
    ),
  },
  {
    date: "2014",
    title: "GATINA_PESA",
    body: (
      <>
        <p>
          Gatina-Pesa in Kawangware Nairobi, was the first to launch and first
          to replicate the Bangla-Pesa model{" "}
        </p>
        <p>
          With an amazing march through the slum, starting from Congo and ending
          at Gatina Primary School,the entire community mobilized around their
          own voucher. Hon. Simba Arati, the area Minister of Parliament,
          officially cut the ribbon and launched the program. Currently the
          network is made up of 258 businesses and a strong wholesale shop that
          backs the system.
        </p>
        <img
          className="max-w-full h-auto rounded-img"
          src="/images/aboutus-imgs/gatina-pesa.webp"
        />
      </>
    ),
  },
  {
    date: "2015",
    title: "3 MORE COMMUNITY CURRENCIES JOINED THE NETWORK !",
    body: (
      <>
        <div className="pesa-items">
          <p className="pesa">Kangemi-Pesa</p>
          <p className="pesa">Lindi-Pesa</p>
          <p className="pesa">Ng'ombeni-Pesa</p>
        </div>
        <img
          className="max-w-full h-auto rounded-img"
          src="/images/aboutus-imgs/carousel3.webp"
        />
      </>
    ),
  },
  {
    date: "2016",
    title: "SARAFU-CREDIT",
    body: (
      <>
        <p>
          All of the 5 networks joined under a common umbrella called
          Sarafu-Credit. This allows members to exchange excess vouchers for
          Kenyan Shillings.
        </p>
        <p>Some other exciting things happened this year:</p>
        <ul>
          <li>
            5 supermarket that act as collateral and network hubs were created
          </li>
          <li>We began testing on platforms to go digital</li>
          <li>
            The initial stages to develop 2 country-wide cooperates (SACCOs)
            began
          </li>
        </ul>
        <img
          className="max-w-full h-auto rounded-img"
          src="/images/aboutus-imgs/carousel4.webp"
        />
        <p className="font-big">
          90% of users are very satisfied with Sarafu Credit and want to keep
          using it
        </p>
      </>
    ),
  },
  {
    date: "2017",
    title: "OUR FIRST RURAL PROGRAM",
    body: (
      <>
        <p>
          This year we setup our first rural program in Miyani in partnership
          with Green World Campaign and we have also pulled all our best
          practices together into a{" "}
          <a href="{{SITEURL}}/pages/get-involved.html" className="cert-link">
            Certificate Course
          </a>{" "}
          to be able to help the movement spread faster!
        </p>
        <img
          className="max-w-full h-auto rounded-img"
          src="/images/aboutus-imgs/carousel5.webp"
        />
      </>
    ),
  },
  {
    date: "2018",
    title: "SARAFU-NETWORK",
    body: (
      <>
        <p>
          Grassroots Economics Foundation helps communities and design, deploy,
          utilize and maintain Community Inclusion Currencies (CICs), which are
          customizable tokenized claims against redemption. We also support
          communities to connect CICs into decentralized economies and share
          certified data for markets and impacts.{" "}
          <a href="{{SITEURL}}/pages/sarafu-network.html" className="read-more">
            Read More
          </a>
        </p>
        <img
          className="max-w-full h-auto "
          src="/images/aboutus-imgs/3d-classes.jpeg"
        />
      </>
    ),
  },

  {
    date: "2020",
    title: "RED CROSS ADOPTION",
    body: (
      <>
        <p>
          Mukuru Kayaba and Kisauni Mombasa were the first sites that the Red
          Cross begain to pilot and introduce Community Inclusion CUrrencies
          implemented in partnership with Grassroots Economics Foundation{" "}
        </p>
        <p>
          The number of registered users grew to over 50,000 and helped support
          communities facing economic downturns due to covid.
        </p>
        <img
          className="max-w-full h-auto rounded-img"
          src="/images/aboutus-imgs/red_cross_kisauni.webp"
        />
      </>
    ),
  },
];
function AboutUs() {
  // <link rel="stylesheet" type="text/css" href="/css/about-us.css">
  return (
    <div className="container mx-auto sm:px-4 max-w-full">
      <div className="flex flex-wrap ">
        <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
          <div className="box-wrap">
            <h2 className="box-title">About Us</h2>
            <p className="box-words">
              Grassroots Economics is a non-profit foundation that seeks to
              empower marginalized communities to take charge of their own
              livelihoods and economic future. We focus on community development
              through economic empowerment and are dedicated to helping
              communities realize and share their abundance. While core
              beneficiaries of our programs include small businesses and people
              living in informal settlements as well as rural areas, the
              documentation and tools have been broadly applied worldwide.
            </p>
            <p className="box-words">
              Our goal is to improve the lives of those who are most vulnerable.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
          <img
            src="/images/aboutus-imgs/aboutus-img1.webp"
            className="max-w-full h-auto"
          />
        </div>
        <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
          <div className="box-wrap">
            <p className="box-words1">
              Our work builds on a rich history of community programs. We have
              implemented community currency programs in over 45 locations
              across Kenya and assisted with 2 in South Africa and helped more
              than 60,000 small businesses, churches and schools take an active
              role in their own economy and development. We are currently
              developing programs all over Kenya and providing technical support
              for those outside Kenya.
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 px-4 md:w-full sm:w-full">
          <h2 className="box-title1">HISTORY</h2>
        </div>
      </div>
      <div className="flex flex-wrap "></div>
      <Timeline items={timeline} />
      <div className="youtube-padding">
        <div className="iframe-container">
          <iframe
            width="1202"
            height="676"
            src="https://www.youtube.com/embed/ojFPrVvpraU"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="grid-color-wrap">
        <div className="text-center">
          <a id="meet-the-team">
            <h2>MEET THE TEAM</h2>
          </a>
          <div className="big-line-between"></div>
        </div>
        <div className="max-w-6xl m-auto grid grid-cols-2  md:grid-cols-3 justify-center ">
          {people.map((p) => (
            <Person person={p} />
          ))}
        </div>
      </div>

      <div className="sponsors-wrapper ">
        <div className="justify-center">
          <a id="sponsors">
            <p className="sponsor-text">Our sponsors and partners include</p>
          </a>
        </div>

        <div className="flex flex-wrap justify-center sponsor-imgs">
          <p className="sponsor-tex1t">Our sponsors and partners include</p>
          <img
            src="/images/aboutus-imgs/spons-stichting.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-da-redcross.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-courtofarms.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-forge.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-iflas.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-redcross.webp"
            className="max-w-full h-auto"
          />
          <img
            src="/images/aboutus-imgs/spons-schumacher.webp"
            className="max-w-full h-auto"
          />
        </div>

        <div className="special-thanks">
          <h3 className="text-center special-title">A special thanks</h3>
          <div className="flex flex-wrap  pt-5 justify-center">
            <div className="w-1/3">
              <h3 className="text-center special-title">Advisors</h3>
              <p>(Choosen for a 6 month period)</p>
              <p>Grace Rachmany</p>
              <p>Gustav Stromfelt</p>
              <p>Holger Hoffmann-Riem</p>
              <p>Reba Chabeda</p>
              <p>Counsel Reza Zain Jaufeerally</p>
              <p>Carmen Mauk</p>
              <p>Professor Jem Bendell</p>
              <p>Robert Mutsaers</p>
              <p>Ahmed Maawy</p>
            </div>
            <div className="w-2/3">
              <h3 className="text-center special-title">
                Sponsors and Volunteers
              </h3>
              <p className="small-text">
                Leila Kidson, Cara Eyre, Thibaud Dezyn, Jimmy Heyns, Henk Van
                Arkel, Elvis Ogweno, Annette Loudon, Chris Lindstrom, Christina
                Bordes, Elizabeth Weiland, Gilfrid Powys, Loucéro Mariani, Jim
                and Ellen Wagner, The Ruddick Family, The Kowa Family, Dawn
                Richards, Edmond Oklahoma United Methodist Women, Prof. Dr.
                Margrit Kennedy, Prof. Declan Kennedy, Dr. Jeremy Bendell, Xenia
                Heinze, Association TAOA, Jamie Brown, Kevin Cox, Sergio Lub,
                Hayem Etienne, Edgar Kampers, DELAMARE, David Hall, MULLER,
                Marie-Hélène, Barbara Schiess, Eva Vander Giessen, Joseph
                Leonardi, Susan Steed, Guido Hosman, Gabriel Grimsditch, Tobias
                Fields, Nemo Curiel, Hugo Godschalk, Guido Hosman, Lorne
                Covington, Bob and Margaret Macemon, Sergio Lub, Mark and Julie
                Richards, Carla Lundberg, PINTO Romain, Scott Williams, Barbara
                Schiess, Aaron Vaillancourt, Leander Bindewald, Brent Ranalli,
                Eric Harris-Braun, Martin Kreidenweis, Georg Pluta, Arthur
                Brock, Daniel Quay, Guy Staniforth
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="last-line" />
    </div>
  );
}
export default AboutUs;
