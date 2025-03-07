/* eslint-disable react/jsx-props-no-spreading */
import { useDispatch } from "react-redux";
import { PictureOutlined } from "@ant-design/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import QrScanner from "qr-scanner";
import { Haptic } from "@/util/haptic";

import { setScannerIsScanning } from "@/redux/device";

import Button, { ButtonProps } from "@/atoms/Button";
import translations from "./translations";
import { translate } from "@/util/translations";

interface ImageSelectButtonProps extends ButtonProps {
  onSelection: (data: string) => void;
}

export default function ImageSelectButton({
  onSelection,
  ...rest
}: ImageSelectButtonProps) {
  const dispatch = useDispatch();
  // function to downscale images (helps QR codes read better)
  const scaleImage = (image) => {
    const maxWidth = 1920;
    const maxHeight = 1080;
    const scaleRatio = Math.min(
      1,
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight
    );

    const width = image.naturalWidth * scaleRatio;
    const height = image.naturalHeight * scaleRatio;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  };

  const handleImageSelectButton = async () => {
    // open OS image picker
    const { dataUrl } = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    // load and scan the chosen image
    const image = new Image();
    image.src = dataUrl;
    image.onload = async () => {
      const scaledImage = scaleImage(image);

      try {
        const result = await QrScanner.scanImage(scaledImage, {
          returnDetailedScanResult: true,
        });
        onSelection(result.data);
        //console.log(result.data);
      } catch (e) {
        await Haptic.error();
        onSelection("");
        //console.error(e);
      }

      dispatch(setScannerIsScanning(false));
    };
  };

  return (
    <Button
      icon={PictureOutlined}
      outerLabel={translate(translations.imageText)}
      onClick={handleImageSelectButton}
      {...rest}
    />
  );
}
