import Category from "../../models/category.js";

export class CategoryController {
  static async index(req, res, next) {
    const categories = await Category.find().sort("name");
    res.status(200).json(categories);
  }

  static async store(req, res, next) {
    const category = await Category.create({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
    });
    res.status(201).json(category);
  }

  static async show(req, res, next) {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  }

  static async update(req, res, next) {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(category);
  }

  static async destroy(req, res, next) {
    const category = await Category.findOneAndDelete({ _id: req.params.id });
    res.status(204).json();
  }
}
