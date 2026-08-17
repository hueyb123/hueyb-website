var projectsData = require("./src/_data/projects.json");
var printsData = require("./src/_data/prints.json");
var markdownIt = require("markdown-it")({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function buildSlugCollection(entries, fallbackTextFn) {
    var usedSlugs = {};
    return (entries || []).map(function (entry, index) {
      var slug = entry.slug ? slugify(entry.slug) : "";
      if (!slug) slug = slugify(fallbackTextFn(entry)) || "untitled-" + (index + 1);
      while (usedSlugs[slug]) slug = slug + "-" + (index + 1);
      usedSlugs[slug] = true;
      return { data: entry, fileSlug: slug };
    });
  }

  eleventyConfig.addCollection("projects", function () {
    return buildSlugCollection(projectsData.entries, function (entry) {
      return entry.title;
    });
  });

  eleventyConfig.addCollection("studioPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/studio/*.md")
      .sort(function (a, b) {
        return b.data.date - a.data.date;
      });
  });

  eleventyConfig.addCollection("prints", function () {
    return buildSlugCollection(printsData.entries, function (entry) {
      return entry.name;
    });
  });

  eleventyConfig.addFilter("dump", function (value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter("markdown", function (value) {
    if (!value) return "";
    return markdownIt.render(value);
  });

  eleventyConfig.addFilter("hasActiveChild", function (children, nav) {
    if (!Array.isArray(children)) return false;
    return children.some(function (child) {
      return String(child.label).toLowerCase() === nav;
    });
  });

  eleventyConfig.addFilter("firstImage", function (media) {
    if (!Array.isArray(media)) return null;
    var found = media.find(function (m) {
      return m.type === "image";
    });
    return found ? found.file : null;
  });

  eleventyConfig.addFilter("readableDate", function (date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });

  eleventyConfig.addFilter("minPrice", function (variants) {
    if (!Array.isArray(variants) || !variants.length) return null;
    return Math.min.apply(
      null,
      variants.map(function (v) {
        return v.price;
      })
    );
  });

  eleventyConfig.addFilter("allSoldOut", function (variants) {
    if (!Array.isArray(variants) || !variants.length) return false;
    return variants.every(function (v) {
      return v.sold_out;
    });
  });

  eleventyConfig.addFilter("hasCategory", function (entries, category) {
    if (!Array.isArray(entries)) return false;
    return entries.some(function (e) {
      return e.category === category;
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
