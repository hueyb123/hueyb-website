var markdownIt = require("markdown-it")({ html: true });
var Image = require("@11ty/eleventy-img").default;
var path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-rss").default);

  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  // Items with an explicit "order" get that exact position. Items without one
  // are ranked by the fallback comparator (date, ongoing, name, etc.) and
  // that natural rank (1, 2, 3...) becomes their position for comparison
  // purposes - so a manually-set order slots in relative to everything else,
  // rather than any explicit order always jumping ahead of every unordered
  // item regardless of the number chosen.
  function sortWithManualOrder(items, fallbackComparator) {
    var naturallySorted = items.slice().sort(fallbackComparator);
    var naturalRank = new Map();
    naturallySorted.forEach(function (item, index) {
      naturalRank.set(item, index + 1);
    });
    return items.slice().sort(function (a, b) {
      var aOrder = typeof a.data.order === "number" ? a.data.order : naturalRank.get(a);
      var bOrder = typeof b.data.order === "number" ? b.data.order : naturalRank.get(b);
      return aOrder - bOrder;
    });
  }

  function toSortableDate(value) {
    if (value instanceof Date) return value.getTime();
    return new Date(String(value)).getTime();
  }

  function addProjectStyleCollection(name, folder) {
    eleventyConfig.addCollection(name, function (collectionApi) {
      var items = collectionApi.getFilteredByGlob("src/content/" + folder + "/*.md");
      return sortWithManualOrder(items, function (a, b) {
        var aOngoing = !!a.data.ongoing;
        var bOngoing = !!b.data.ongoing;
        if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
        return toSortableDate(b.data.date) - toSortableDate(a.data.date);
      });
    });
  }

  function addBlogStyleCollection(name, folder) {
    eleventyConfig.addCollection(name, function (collectionApi) {
      var items = collectionApi.getFilteredByGlob("src/content/" + folder + "/*.md");
      return sortWithManualOrder(items, function (a, b) {
        return toSortableDate(b.data.date) - toSortableDate(a.data.date);
      });
    });
  }

  addProjectStyleCollection("photography", "photography");
  addProjectStyleCollection("installations", "installations");
  addBlogStyleCollection("paintingGoodTimes", "good-times");
  addBlogStyleCollection("paintingBadTimes", "bad-times");
  addBlogStyleCollection("blogPosts", "blog");

  eleventyConfig.addCollection("painting", function (collectionApi) {
    var items = collectionApi.getFilteredByGlob(["src/content/good-times/*.md", "src/content/bad-times/*.md"]);
    return sortWithManualOrder(items, function (a, b) {
      return toSortableDate(b.data.date) - toSortableDate(a.data.date);
    });
  });

  eleventyConfig.addCollection("prints", function (collectionApi) {
    var items = collectionApi.getFilteredByGlob("src/content/prints/*.md");
    return sortWithManualOrder(items, function (a, b) {
      return a.data.name.localeCompare(b.data.name);
    });
  });

  eleventyConfig.addCollection("cv", function (collectionApi) {
    var items = collectionApi.getFilteredByGlob("src/content/cv/*.md");
    return sortWithManualOrder(items, function (a, b) {
      return String(b.data.year).localeCompare(String(a.data.year));
    }).map(function (item) {
      return item.data;
    });
  });

  eleventyConfig.addCollection("feedItems", function (collectionApi) {
    var galleryFolders = [
      { folder: "photography", label: "Photography" },
      { folder: "installations", label: "Installations" },
    ];
    var postFolders = [
      { folder: "good-times", label: "Good Times", urlFolder: "painting" },
      { folder: "bad-times", label: "Bad Times", urlFolder: "painting" },
      { folder: "blog", label: "Blog" },
    ];
    var items = [];
    galleryFolders.forEach(function (entry) {
      collectionApi.getFilteredByGlob("src/content/" + entry.folder + "/*.md").forEach(function (item) {
        items.push({
          title: "New " + entry.label + ": " + item.data.title,
          url: "/" + entry.folder + "/" + item.fileSlug + "/",
          date: item.date,
        });
      });
    });
    postFolders.forEach(function (entry) {
      collectionApi.getFilteredByGlob("src/content/" + entry.folder + "/*.md").forEach(function (item) {
        items.push({
          title: item.data.headline || entry.label + " update",
          url: "/" + (entry.urlFolder || entry.folder) + "/" + item.fileSlug + "/",
          date: item.date,
        });
      });
    });
    return items.sort(function (a, b) {
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

  eleventyConfig.addFilter("paintingSection", function (inputPath) {
    return inputPath && inputPath.indexOf("/bad-times/") !== -1 ? "bad-times" : "good-times";
  });

  eleventyConfig.addFilter("hasActiveChild", function (children, nav) {
    if (!Array.isArray(children)) return false;
    return children.some(function (child) {
      return child.key === nav;
    });
  });

  eleventyConfig.addFilter("firstImage", function (media) {
    if (!Array.isArray(media)) return null;
    var found = media.find(function (m) {
      return m.type === "image";
    });
    return found ? found.file : null;
  });

  var THUMBNAIL_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];

  eleventyConfig.addAsyncFilter("thumbnail", async function (src) {
    if (!src) return null;
    if (THUMBNAIL_EXTENSIONS.indexOf(path.extname(src).toLowerCase()) === -1) return null;
    try {
      var metadata = await Image(path.join("src", src), {
        widths: [240],
        formats: ["jpeg"],
        outputDir: "_site/assets/thumbs",
        urlPath: "/assets/thumbs/",
        filenameFormat: function (id, inputPath, width, format) {
          var name = path.basename(inputPath, path.extname(inputPath));
          return name + "-" + width + "w." + format;
        },
      });
      return metadata.jpeg[metadata.jpeg.length - 1].url;
    } catch (e) {
      console.warn("thumbnail filter failed for " + src + ": " + e.message);
      return null;
    }
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
