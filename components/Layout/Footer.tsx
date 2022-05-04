export function Footer() {
  return (
    <div className="row">
      <div className="col-lg-12 base-footer">
        <a href="https://wa.me/254757628885">
          <img
            className="img-fluid"
            src="{{SITEURL}}/theme/images/base-imgs/whatsaap.webp"
          />
        </a>
        <a href="https://www.facebook.com/grassrootseconomicsfoundation/">
          <img
            className="img-fluid"
            src="{{SITEURL}}/theme/images/base-imgs/facebook.webp"
          />
        </a>
        <a href="https://twitter.com/grassecon?lang=en">
          <img
            className="img-fluid"
            src="{{SITEURL}}/theme/images/base-imgs/twitter.webp"
          />
        </a>
        <a href="https://www.youtube.com/user/motomotocircus/featured">
          <img
            className="img-fluid"
            src="{{SITEURL}}/theme/images/base-imgs/youtube.webp"
          />
        </a>
        <a
          id="terms-conditions"
          href="{{SITEURL}}/pages/terms-and-conditions.html"
        >
          TERMS AND CONDITIONS
        </a>
      </div>
    </div>
  );
}
