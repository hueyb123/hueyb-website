module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  function getProjects(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/projects/*.md")
      .sort(function (a, b) {
        return b.data.date - a.data.date;
      });
  }

  eleventyConfig.addCollection("projects", getProjects);
  eleventyConfig.addCollection("projectsCurrent", function (collectionApi) {
    return getProjects(collectionApi).filter(function (p) {
      return p.data.status === "current";
    });
  });
  eleventyConfig.addCollection("projectsPast", function (collectionApi) {
    return getProjects(collectionApi).filter(function (p) {
      return p.data.status === "past";
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
