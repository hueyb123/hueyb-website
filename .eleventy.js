var markdownIt = require("markdown-it")({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-rss").default);

  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  function orderThenFallback(a, b, fallback) {
    var aOrder = typeof a.data.order === "number" ? a.data.order : null;
    var bOrder = typeof b.data.order === "number" ? b.data.order : null;
    if (aOrder !== null && bOrder !== null) return aOrder - bOrder;
    if (aOrder !== null) return -1;
    if (bOrder !== null) return 1;
    return fallback(a, b);
  }

  function toSortableDate(value) {
    if (value instanceof Date) return value.getTime();
    return new Date(String(value)).getTime();
  }

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/projects/*.md")
      .sort(function (a, b) {
        return orderThenFallback(a, b, function () {
          var aOngoing = !!a.data.ongoing;
          var bOngoing = !!b.data.ongoing;
          if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
          return toSortableDate(b.data.date) - toSortableDate(a.data.date);
        });
      });
  });

  eleventyConfig.addCollection("studioPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/studio/*.md")
      .sort(function (a, b) {
        return orderThenFallback(a, b, function () {
          return b.data.date - a.data.date;
        });
      });
  });

  eleventyConfig.addCollection("prints", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/prints/*.md")
      .sort(function (a, b) {
        return orderThenFallback(a, b, function () {
          return a.data.name.localeCompare(b.data.name);
        });
      });
  });

  eleventyConfig.addCollection("cv", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/cv/*.md")
      .sort(function (a, b) {
        return orderThenFallback(a, b, function () {
          return String(b.data.year).localeCompare(String(a.data.year));
        });
      })
      .map(function (item) {
        return item.data;
      });
  });

  eleventyConfig.addCollection("feedItems", function (collectionApi) {
    var projects = collectionApi.getFilteredByGlob("src/content/projects/*.md").map(function (item) {
      return {
        title: "New Project: " + item.data.title,
        url: "/projects/" + item.fileSlug + "/",
        date: item.date,
      };
    });
    var studio = collectionApi.getFilteredByGlob("src/content/studio/*.md").map(function (item) {
      return {
        title: item.data.headline || "Studio update",
        url: "/studio/" + item.fileSlug + "/",
        date: item.date,
      };
    });
    return projects.concat(studio).sort(function (a, b) {
      return b.date - a.date;
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
