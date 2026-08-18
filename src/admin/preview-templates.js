CMS.registerPreviewStyle(
  "https://fonts.googleapis.com/css2?family=Blinker:wght@400;600;700&family=Silkscreen:wght@400;700&display=swap"
);
CMS.registerPreviewStyle("/styles.css");

function assetUrl(getAsset, path) {
  if (!path) return "";
  try {
    var asset = getAsset(path);
    return asset ? asset.toString() : "";
  } catch (e) {
    return "";
  }
}

function renderHeading(text) {
  return h("section", { className: "page-header" }, h("h1", {}, text));
}

function renderMedia(getAsset, media, imgClass) {
  return (media || []).map(function (item, i) {
    var src = assetUrl(getAsset, item.file);
    if (!src) return null;
    if (item.type === "video") {
      return h("video", { key: i, src: src, controls: true, className: imgClass, style: { width: "100%", marginBottom: "8px" } });
    }
    if (item.type === "audio") {
      return h("audio", { key: i, src: src, controls: true, style: { width: "100%", marginBottom: "8px" } });
    }
    return h("img", { key: i, src: src, className: imgClass, style: { width: "100%", marginBottom: "8px" } });
  });
}

var GalleryPreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading(data.title || "Untitled"),
      data.ongoing ? h("p", { style: { color: "#39ff14" } }, "Ongoing") : null,
      renderMedia(getAsset, data.media, "project-media-image"),
      this.props.widgetFor("body")
    );
  },
});
CMS.registerPreviewTemplate("photography", GalleryPreview);
CMS.registerPreviewTemplate("painting", GalleryPreview);
CMS.registerPreviewTemplate("collage", GalleryPreview);
CMS.registerPreviewTemplate("installations", GalleryPreview);

var BlogPreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    var md = window.markdownit();
    var dateLabel = data.date ? new Date(data.date).toDateString() : "";

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading(data.headline || dateLabel || "Untitled"),
      data.headline && dateLabel ? h("p", { style: { color: "#8a8a86" } }, dateLabel) : null,
      renderMedia(getAsset, data.media, "studio-media-image"),
      data.body ? h("div", { dangerouslySetInnerHTML: { __html: md.render(data.body) } }) : null
    );
  },
});
CMS.registerPreviewTemplate("blog", BlogPreview);

var BlogSettingsPreview = createClass({
  render: function () {
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading("Blog"),
      data.tagline ? h("p", { style: { color: "#8a8a86" } }, data.tagline) : null
    );
  },
});
CMS.registerPreviewTemplate("blog_settings", BlogSettingsPreview);

var PrintsPreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    var imgSrc = assetUrl(getAsset, data.image);
    var variants = data.variants || [];

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", maxWidth: "640px", textAlign: "center" } },
      renderHeading(data.name || "Untitled"),
      imgSrc ? h("img", { src: imgSrc, style: { width: "100%", marginBottom: "16px" } }) : null,
      data.description ? h("p", {}, data.description) : null,
      h(
        "ul",
        { style: { listStyle: "none", padding: 0 } },
        variants.map(function (v, j) {
          return h(
            "li",
            { key: j },
            (v.label || "Size") + " — $" + (v.price != null ? v.price : "?") + (v.sold_out ? " (Sold Out)" : "")
          );
        })
      )
    );
  },
});
CMS.registerPreviewTemplate("prints", PrintsPreview);

var HomePreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    var videos = data.videos || [];

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading(data.title || "Untitled"),
      data.description ? h("p", {}, data.description) : null,
      h(
        "div",
        { style: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" } },
        videos.map(function (v, i) {
          var src = assetUrl(getAsset, v.file);
          return src ? h("video", { key: i, src: src, controls: true, style: { width: "260px" } }) : null;
        })
      )
    );
  },
});
CMS.registerPreviewTemplate("home", HomePreview);

var CvPreview = createClass({
  render: function () {
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading(data.title || "Untitled"),
      h("p", { style: { color: "#8a8a86" } }, (data.year || "") + (data.venue ? " — " + data.venue : "")),
      data.category ? h("p", { style: { color: "#39ff14" } }, data.category) : null
    );
  },
});
CMS.registerPreviewTemplate("cv", CvPreview);
