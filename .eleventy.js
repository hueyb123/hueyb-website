module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  function toSortableDate(value) {
    if (value instanceof Date) return value.getTime();
    return new Date(String(value)).getTime();
  }

  function getProjects(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/projects/*.md")
      .sort(function (a, b) {
        var aOrder = typeof a.data.order === "number" ? a.data.order : null;
        var bOrder = typeof b.data.order === "number" ? b.data.order : null;
        if (aOrder !== null && bOrder !== null) return aOrder - bOrder;
        if (aOrder !== null) return -1;
        if (bOrder !== null) return 1;

        var aOngoing = !!a.data.ongoing;
        var bOngoing = !!b.data.ongoing;
        if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;
        return toSortableDate(b.data.date) - toSortableDate(a.data.date);
      });
  }

  eleventyConfig.addCollection("projects", getProjects);

  eleventyConfig.addCollection("studioPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/studio/*.md")
      .sort(function (a, b) {
        return b.data.date - a.data.date;
      });
  });

  eleventyConfig.addCollection("prints", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/prints/*.md")
      .sort(function (a, b) {
        return a.data.name.localeCompare(b.data.name);
      });
  });

  eleventyConfig.addFilter("dump", function (value) {
    return JSON.stringify(value);
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
    return date.toLocaleDateString("en-US", {
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
