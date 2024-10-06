"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

function Calculator() {
  const [inputs, setInputs] = useState({
    R_star: "",
    L_star: "",
    T_eff: "",
    R_planet: "",
    M_planet: "",
    semi_major_axis: "",
    eccentricity: "",
    inclination: "",
    albedo: "",
    distance: "",
    D_telescope: "",
    wavelength: "",
    IWA: "",
    OWA: "",
    contrast_limit: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/habitable-exoplanet-calculator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputs),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Posted data:", result);
      if (result.created == true) {
        toast.success("Data posted successfully!");
        window.location.reload();
      }
    } catch (error) {
      toast.error("Error posting data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white px-[50px] py-[70px] w-full ">
        <div className="text-[40px] font-medium pb-[30px]">
          Habitable Planet Calculator:
        </div>
        <div className="flex items-center justify-center gap-[300px]">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="R_star" className="block mb-1 text-[13px]">
                R_star:
              </label>
              <input
                id="R_star"
                placeholder=""
                value={inputs.R_star}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="L_star" className="block mb-1 text-[13px]">
                L_star:
              </label>
              <input
                id="L_star"
                placeholder=""
                value={inputs.L_star}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="T_eff" className="block mb-1 text-[13px]">
                T_eff:
              </label>
              <input
                id="T_eff"
                placeholder=""
                value={inputs.T_eff}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="R_planet" className="block mb-1 text-[13px]">
                R_planet:
              </label>
              <input
                id="R_planet"
                placeholder=""
                value={inputs.R_planet}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="M_planet" className="block mb-1 text-[13px]">
                M_planet:
              </label>
              <input
                id="M_planet"
                placeholder=""
                value={inputs.M_planet}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="semi_major_axis"
                className="block mb-1 text-[13px]"
              >
                semi_major_axis:
              </label>
              <input
                id="semi_major_axis"
                placeholder=""
                value={inputs.semi_major_axis}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="eccentricity" className="block mb-1 text-[13px]">
                eccentricity:
              </label>
              <input
                id="eccentricity"
                placeholder=""
                value={inputs.eccentricity}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="inclination" className="block mb-1 text-[13px]">
                inclination:
              </label>
              <input
                id="inclination"
                placeholder=""
                value={inputs.inclination}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="albedo" className="block mb-1 text-[13px]">
                albedo:
              </label>
              <input
                id="albedo"
                placeholder=""
                value={inputs.albedo}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="distance" className="block mb-1 text-[13px]">
                distance:
              </label>
              <input
                id="distance"
                placeholder=""
                value={inputs.distance}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="D_telescope" className="block mb-1 text-[13px]">
                D_telescope:
              </label>
              <input
                id="D_telescope"
                placeholder=""
                value={inputs.D_telescope}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="wavelength" className="block mb-1 text-[13px]">
                wavelength:
              </label>
              <input
                id="wavelength"
                placeholder=""
                value={inputs.wavelength}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="IWA" className="block mb-1 text-[13px]">
                IWA:
              </label>
              <input
                id="IWA"
                placeholder=""
                value={inputs.IWA}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="OWA" className="block mb-1 text-[13px]">
                OWA:
              </label>
              <input
                id="OWA"
                placeholder=""
                value={inputs.OWA}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="contrast_limit"
                className="block mb-1 text-[13px]"
              >
                contrast_limit:
              </label>
              <input
                id="contrast_limit"
                placeholder=""
                value={inputs.contrast_limit}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 w-[400px] focus:outline-none focus:border-black focus:bg-gray-100"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}

export default Calculator;
