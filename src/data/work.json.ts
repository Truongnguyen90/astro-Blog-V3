export interface Template {
  url: string;
  projectUrl: string;
  description: string;
  title: string;
  image: string;
  projectImage1: string;
  projectImage2: string;
  projectImage3: string;
  projectImage4: string;

};
const workOne: Template = {
  url: "/project",
  projectUrl: "/case-study",
  title: "Monoqrom",
  description: "Quick method to start your design projects in Figma and Tailwind CSS.",
  image: "/images/monoqrom.svg",
 projectImage1: "/images/project1.png",
  projectImage2: "/images/project2.png",
  projectImage3: "/images/project3.png",
  projectImage4: "/images/project4.png",
};
const workTwo: Template = {
  url: "/project",
    projectUrl: "/case-study",
  image: "/images/diagonal.svg",
  description: "28 Dark mesh wallpapers to use on your projects or as wallpapers",
  title: "Diagonal",
  projectImage1: "https://d33wubrfki0l68.cloudfront.net/36f894e19944a384d46f547d575a8d7f2e266089/9b56c/phones.jpg",
  projectImage2: "https://d33wubrfki0l68.cloudfront.net/38339d9eb23a6c8bbc951fb7aa47dc8d1e3a11c8/1dec0/imac.jpg",
  projectImage3: "https://d33wubrfki0l68.cloudfront.net/ba3aebd7099353fa152eb41a7a5294566755f8d0/b752c/tablet.jpg",
  projectImage4: "https://d33wubrfki0l68.cloudfront.net/2f9f738ca398f15afa86b284f627cd1d84a96719/683c3/mac.jpg",
};
const workThree: Template = {
  url: "/project",
  projectUrl: "/case-study",
  image: "/images/onda.svg",
  description: "16 Wave wallpapers to use on your projects or as wallpapers",
  title: "Onda",
  projectImage1: "https://d33wubrfki0l68.cloudfront.net/9546aec08a5325584f49c1cab9d1420e982fb7af/cc35a/o1.jpg",
  projectImage2: "https://d33wubrfki0l68.cloudfront.net/3d1304e838e1384d80d5158ec3ed040d0ec1238e/68e80/o2.jpg",
  projectImage3: "https://d33wubrfki0l68.cloudfront.net/8db05fb498ced646ad7e0ea00951a3ad35ca0af2/5006c/o3.jpg",
  projectImage4: "https://d33wubrfki0l68.cloudfront.net/6286d3a5d5d739c4729dc7cc6769ea4441b48cc6/2d2a4/o4.jpg",
};
const workfour: Template = {
  url: "/project",
    projectUrl: "/case-study",
  image: "/images/figmax.svg",
  description: "A set of Figma covers inspired on 90's VHS Covers",
  title: "FigMax90",
  projectImage1: "/images/monoqrom.svg",
  projectImage2: "/images/monoqrom.svg",
  projectImage3: "/images/monoqrom.svg",
  projectImage4: "/images/monoqrom.svg",
};
export const byName = {
  workOne,
  workTwo,
  workThree,
  workfour,
};
export const work = Object.values(byName);
