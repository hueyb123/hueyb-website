CMS.registerPreviewStyle(
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Silkscreen:wght@400;700&display=swap"
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

var ProjectsPreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    var entries = data.entries || [];
    var md = window.markdownit();

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      h("p", { style: { color: "#8a8a86", marginBottom: "32px" } }, entries.length + " project(s), in display order:"),
      entries.map(function (project, i) {
        return h(
          "div",
          { key: i, style: { marginBottom: "56px", paddingBottom: "40px", borderBottom: "1px solid #262626" } },
          renderHeading(project.title || "Untitled"),
          project.ongoing ? h("p", { style: { color: "#39ff14" } }, "Ongoing") : null,
          project.description
            ? h("div", { className: "project-description", dangerouslySetInnerHTML: { __html: md.render(project.description) } })
            : null,
          renderMedia(getAsset, project.media, "project-media-image")
        );
      })
    );
  },
});
CMS.registerPreviewTemplate("projects", ProjectsPreview);

var StudioPreview = createClass({
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
CMS.registerPreviewTemplate("studio", StudioPreview);

var PrintsPreview = createClass({
  render: function () {
    var getAsset = this.props.getAsset;
    var data = (this.props.entry.get("data") || {}).toJS ? this.props.entry.get("data").toJS() : {};
    var variants = data.variants || [];
    var imgSrc = assetUrl(getAsset, data.image);

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", maxWidth: "640px", textAlign: "center" } },
      renderHeading(data.name || "Untitled"),
      imgSrc ? h("img", { src: imgSrc, style: { width: "100%", marginBottom: "16px" } }) : null,
      data.description ? h("p", {}, data.description) : null,
      h(
        "ul",
        { style: { listStyle: "none", padding: 0 } },
        variants.map(function (v, i) {
          return h(
            "li",
            { key: i },
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
    var entries = data.entries || [];

    return h(
      "div",
      { className: "container", style: { paddingTop: "40px", paddingBottom: "40px", textAlign: "center" } },
      renderHeading("CV"),
      h(
        "ul",
        { style: { listStyle: "none", padding: 0 } },
        entries.map(function (e, i) {
          return h(
            "li",
            { key: i, style: { marginBottom: "8px" } },
            (e.year || "") + " — " + (e.title || "") + (e.venue ? " (" + e.venue + ")" : "") + "  [" + (e.category || "") + "]"
          );
        })
      )
    );
  },
});
CMS.registerPreviewTemplate("cv", CvPreview);
