import createDebugger from "debug";
import Productor from "../../models/productor.js";
import Review from "../../models/review.js";

const debug = createDebugger("express-api:productors");

export class ProductorController {
  static async index(req, res, next) {
    //if query string contains a location, filter by location
    let productors;
    if (req.query.location) {
      productors = await Productor.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: req.query.location.split(",").map(Number),
            },
            distanceField: "distance",
            spherical: true,

            maxDistance: parseInt(req.query.distance) || 100,
          },
        },
        {
          $lookup: {
            from: "images",
            localField: "images",
            foreignField: "_id",
            as: "images",
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviews",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "products",
            foreignField: "_id",
            as: "products",
          },
        },
      ]);
    } else {
      productors = await Productor.find()
        .sort("name")
        .populate("images")
        .populate({
          path: "reviews",
          populate: {
            path: "author",
            model: "User",
          },
        })
        .populate({
          path: "products",
          populate: {
            path: "images",
            model: "Image",
          },
        });
    }

    try {
      //hide properties from response
      const productorsFiltered = productors.map((productor) => {
        let obj = productor;
        delete obj.password;
        delete obj.__v;
        delete obj.role;
        delete obj.conversations;
        delete obj.updatedAt;
        delete obj.createdAt;
        delete obj.type;

        return obj;
      });
      res.status(200).json(productorsFiltered);
    } catch (err) {
      next(err);
    }
  }

  static async store(req, res, next) {
    const user = new Productor({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      location: req.body.location,
    });
    const result = await user.save();
    res.status(201).json(result);
  }

  static async show(req, res, next) {
    const user = await Productor.findById(req.params.id)
      .populate("images")
      .populate({
        path: "products",
        populate: {
          path: "images",
          model: "Image",
        },
      })
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          model: "User",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "Productor not found" });
    }
    res.status(200).json(user);
  }

  static async update(req, res, next) {
    const user = await Productor.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json(user);
  }

  static async destroy(req, res, next) {
    const user = await Productor.findOneAndDelete({ _id: req.params.id });
    res.status(204).json();
  }
}
