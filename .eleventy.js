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

  // Items with an explicit "order" get inserted at that literal 1-indexed
  // position in the final list (order: 1 is always first, full stop).
  // Items without one fill the remaining slots, in their relative order from
  // the fallback comparator (date, ongoing, name, etc.), around whichever
  // slots the explicitly-ordered items claimed.
  function sortWithManualOrder(items, fallbackComparator) {
    var explicit = items
      .filter(function (item) {
        return typeof item.data.order === "number";
      })
      .sort(function (a, b) {
        return a.data.order - b.data.order;
      });
    var natural = items
      .filter(function (item) {
        return typeof item.data.order !== "number";
      })
      .sort(fallbackComparator);

    var result = [];
    var explicitIndex = 0;
    var naturalIndex = 0;
    var position = 1;
    while (explicitIndex < explicit.length || naturalIndex < natural.length) {
      if (explicitIndex < explicit.length && explicit[explicitIndex].data.order <= position) {
        result.push(explicit[explicitIndex]);
        explicitIndex++;
      } else if (naturalIndex < natural.length) {
        result.push(natural[naturalIndex]);
        naturalIndex++;
      } else {
        result.push(explicit[explicitIndex]);
        explicitIndex++;
      }
      position++;
    }
    return result;
  }

  function toSortableDate(value) {
    if (value instanceof Date) return value.getTime();
    if (!value) return -Infinity;
    var parsed = new Date(String(value)).getTime();
    return isNaN(parsed) ? -Infinity : parsed;
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

  function addPaintingMoodCollection(name, mood) {
    eleventyConfig.addCollection(name, function (collectionApi) {
      var items = collectionApi.getFilteredByGlob("src/content/painting/*.md").filter(function (item) {
        return (item.data.mood || "Good Times") === mood;
      });
      return sortWithManualOrder(items, function (a, b) {
        return toSortableDate(b.data.date) - toSortableDate(a.data.date);
      });
    });
  }

  addProjectStyleCollection("photography", "photography");
  addProjectStyleCollection("installations", "installations");
  addBlogStyleCollection("painting", "painting");
  addPaintingMoodCollection("paintingGoodTimes", "Good Times");
  addPaintingMoodCollection("paintingBadTimes", "Bad Times");
  addBlogStyleCollection("blogPosts", "blog");

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
      { folder: "painting", label: "Painting" },
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
          url: "/" + entry.folder + "/" + item.fileSlug + "/",
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

  eleventyConfig.addAsyncFilter("thumbnail", async function (src, width) {
    if (!src) return null;
    if (THUMBNAIL_EXTENSIONS.indexOf(path.extname(src).toLowerCase()) === -1) return null;
    var targetWidth = width || 240;
    try {
      var metadata = await Image(path.join("src", src), {
        widths: [targetWidth],
        formats: ["jpeg"],
        outputDir: "_site/assets/thumbs",
        urlPath: "/assets/thumbs/",
        filenameFormat: function (id, inputPath, targetWidth, format) {
          var name = path.basename(inputPath, path.extname(inputPath));
          return name + "-" + targetWidth + "w." + format;
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
