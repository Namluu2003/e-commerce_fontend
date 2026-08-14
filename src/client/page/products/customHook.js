// hooks/useProductDetail.js
import { useEffect, useState } from "react";
import {
  apiGetColorsOfProductAndSoleId,
  apiGetMaterialsOfProductAndGenderId,
  apiGetSolesOfProductAndMaterialId,
  apiGetSizesOfProductAndColor,
  apiGetColorsOfProduct,
  apiGetMaterialssOfProduct,
  apiGetGendersOfProduct,
  apiGetSolesOfProduct,
  apiGetSizesOfProduct,
  apigetProductDetail
} from "../product/api";
import { message } from "antd";

export const useProductDetail = ({ productId, color, size, sole, material, gender }) => {
  const [state, setState] = useState({
    productDetail: null,
    colors: [],
    sizes: [],
    soles: [],
    materials: [],
    genders: [],
    sizesOfColor: [],
    colorOfSole: [],
    soleOfMaterial: [],
    materialOfGender: [],
    loading: false
  });

  const setPartialState = (partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  // Fetch chi tiết sản phẩm
  const fetchProductDetail = async () => {
    try {
      setPartialState({ loading: true });
      const res = await apigetProductDetail(productId, color, size, gender, material, sole);
      setPartialState({ productDetail: res.data });
    } catch (err) {
      message.error("Lỗi khi lấy chi tiết sản phẩm");
    } finally {
      setPartialState({ loading: false });
    }
  };

  // Fetch các thuộc tính chung
  const fetchAttributes = async () => {
    try {
      setPartialState({ loading: true });
      const [colors, materials, genders, soles, sizes] = await Promise.all([
        apiGetColorsOfProduct(productId),
        apiGetMaterialssOfProduct(productId),
        apiGetGendersOfProduct(productId),
        apiGetSolesOfProduct(productId),
        apiGetSizesOfProduct(productId)
      ]);
      setPartialState({
        colors: colors.data,
        materials: materials.data,
        genders: genders.data,
        soles: soles.data,
        sizes: sizes.data
      });
    } catch (err) {
      message.error("Lỗi khi lấy thuộc tính sản phẩm");
    } finally {
      setPartialState({ loading: false });
    }
  };

  // Fetch dữ liệu phụ thuộc (khi thay đổi gender, material, sole, color)
  const fetchDependentAttributes = async () => {
    try {
      const [materials, soles, colors, sizesOfColor] = await Promise.all([
        gender ? apiGetMaterialsOfProductAndGenderId(productId, gender) : [],
        material ? apiGetSolesOfProductAndMaterialId(productId, material, gender) : [],
        sole ? apiGetColorsOfProductAndSoleId(productId, sole, material, gender) : [],
        color ? apiGetSizesOfProductAndColor(productId, color, sole, material, gender) : [],
      ]);
      setPartialState({
        materialOfGender: materials.data || [],
        soleOfMaterial: soles.data || [],
        colorOfSole: colors.data || [],
        sizesOfColor: sizesOfColor.data || []
      });
    } catch (err) {
      message.error("Lỗi khi lấy dữ liệu phụ thuộc");
    }
  };

  useEffect(() => {
    if (productId) {
      fetchAttributes();
    }
  }, [productId]);

  useEffect(() => {
    if (productId && color && size) {
      fetchProductDetail();
    }
  }, [productId, color, size, gender, material, sole]);

  useEffect(() => {
    fetchDependentAttributes();
  }, [gender, material, sole, color]);

  return {
    ...state,
    setPartialState,
  };
};
