import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const images = [
  { src: gallery1, alt: "Men's haircut and styling", span: "col-span-2 row-span-2" },
  { src: gallery2, alt: "Hair coloring and treatment", span: "" },
  { src: gallery3, alt: "Nail spa and care", span: "" },
  { src: gallery4, alt: "Bridal makeup artistry", span: "col-span-2" },
];

const GallerySection = () => (
  <section id="gallery" className="section-padding">
    <div className="container mx-auto">
      <div className="text-center mb-16">
        <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">Our Work</p>
        <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Style Gallery</h2>
        <div className="w-20 h-px gold-gradient mx-auto" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto auto-rows-[200px] md:auto-rows-[250px]">
        {images.map((img, i) => (
          <div
            key={i}
            className={`${img.span} rounded-xl overflow-hidden group cursor-pointer relative`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-500" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
