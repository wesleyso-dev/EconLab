import base64
from io import BytesIO
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
import numpy as np

class Line:
  def __init__(self, x_1, y_1, x_2, y_2):
    self.x_1 = x_1
    self.y_1 = y_1
    self.x_2 = x_2
    self.y_2 = y_2

def intersection(line_1, line_2):
  a_1 = line_1.y_2 - line_1.y_1
  b_1 = line_1.x_1 - line_1.x_2
  c_1 = a_1 * line_1.x_1 + b_1 * line_1.y_1

  a_2 = line_2.y_2 - line_2.y_1
  b_2 = line_2.x_1 - line_2.x_2
  c_2 = a_2 * line_2.x_2 + b_2 * line_2.y_2
  
  determinant = a_1 * b_2 - a_2 * b_1
  x = (b_2 * c_1 - b_1 * c_2) / determinant
  y = (a_1 * c_2 - a_2 * c_1) / determinant

  return {
    "determinant": determinant,
    "x": round(x, 2),
    "y": round(y, 2)
  }

# Main function
def get_data(data):
  name = data.get("name")
  ret_value = []

  # Bowed PPF
  if name == "Bowed PPF":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)

    x_int = data.get("xInt")
    y_int = data.get("yInt")

    h, k = 0, y_int

    a = (0 - k) / (x_int - h) ** 2

    x_values = list(np.linspace(0, x_int, 400))
    y_values = list(map(lambda x: a * (x - h) ** 2 + k, x_values))

    ax.plot(x_values, y_values)

    ax.legend()

  # Linear PPF
  elif name == "Linear PPF":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)

    x_int = data.get("xInt")
    y_int = data.get("yInt")

    x = np.linspace(0, x_int, num=5)
    y = np.linspace(y_int, 0, num=5)

    good_x_opportunity_cost = round(y_int / x_int, 2)
    good_y_opportunity_cost = round(x_int / y_int, 2)

    ret_value.extend([x_label, y_label, good_x_opportunity_cost, good_y_opportunity_cost])

    ax.plot(x, y)
    ax.legend()

  # Price Controls
  elif name == "Price Controls":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    ax.set_title("Market")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")

    price_control = data.get("priceControl")
    price = data.get("price")

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    price_control_list = [price] * len(supply_x)
  
    ax.plot(supply_x, supply_y, label="S")
    ax.plot(demand_x, demand_y, label="D")
    ax.plot(supply_x, price_control_list, label="Price Control")

    price_control_line, supply_line, demand_line = Line(supply_x_1, price, supply_x_2, price), Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    supply_intersection_dict = intersection(price_control_line, supply_line)
    demand_intersection_dict = intersection(price_control_line, demand_line)
    supply_determinant, supply_quantity_intersection, supply_price_intersection = supply_intersection_dict["determinant"], supply_intersection_dict["x"], supply_intersection_dict["y"]
    demand_determinant, demand_quantity_intersection, demand_price_intersection = demand_intersection_dict["determinant"], demand_intersection_dict["x"], demand_intersection_dict["y"]

    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, price_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]

    if supply_determinant == 0:
      ret_value.extend([None, None])
    else:
      ret_value.extend([round(quantity_equilibrium, 2), round(price_equilibrium, 2)])
    
    if price_control == "Price Floor":
      if price <= price_equilibrium:
        ret_value.append("Non-Binding")
      else:
        ret_value.append("Price Floor")
    else:
      if price >= price_equilibrium:
        ret_value.append("Non-Binding")
      else:
        ret_value.append("Price Ceiling")

    ret_value.append(round(max(supply_quantity_intersection, demand_quantity_intersection) - min(supply_quantity_intersection, demand_quantity_intersection), 2))
    ax.legend()

  # Shifts in Supply and Demand
  elif name == "Shifts in Supply and Demand":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    ax.set_title("Market")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")
    supply_shifter = data.get("supplyShifter")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")
    demand_shifter = data.get("demandShifter")

    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, price_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]

    if determinant == 0:
      ret_value.extend([None, None])
    else:
      ret_value.extend([round(quantity_equilibrium, 2), round(price_equilibrium, 2)])

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    ax.plot(supply_x, supply_y, label="S")
    ax.plot(demand_x, demand_y, label="D")

    supply_left_shifts = ["increasedPricesOfResourcesOrInputs", "taxes", "decreasedCompetition"]
    supply_right_shifts = ["decreasedPricesOfResourcesOrInputs", "subsidies", "increasedCompetition"]

    demand_left_shifts = ["decreasedMarketSize", "decreasedPriceOfASubstitute", "increasedPriceOfAComplement"]
    demand_right_shifts = ["increasedMarketSize", "increasedPriceOfASubstitute", "decreasedPriceOfAComplement"]

    supply_shift = demand_shift = "Unchanged"
    
    if supply_shifter in supply_left_shifts:
      delta_x = supply_x_2 - supply_x_1
      shifted_supply_x = np.linspace(supply_x_1 - delta_x / 4, supply_x_2 - delta_x / 4, num=5)
      ax.plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Left"
    elif supply_shifter in supply_right_shifts:
      delta_x = supply_x_2 - supply_x_1
      shifted_supply_x = np.linspace(supply_x_1 + delta_x / 4, supply_x_2 + delta_x / 4, num=5)
      ax.plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Right"
    if demand_shifter in demand_left_shifts:
      delta_x = demand_x_2 - demand_x_1
      shifted_demand_x = np.linspace(demand_x_1 - delta_x / 4, demand_x_2 - delta_x / 4, num=5)
      ax.plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Left"
    elif demand_shifter in demand_right_shifts:
      delta_x = demand_x_2 - demand_x_1
      shifted_demand_x = np.linspace(demand_x_1 + delta_x / 4, demand_x_2 + delta_x / 4, num=5)
      ax.plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Right"

    quantity_change = price_change = "None"
    
    if supply_shift == "Left" and demand_shift == "Left":
      quantity_change = "Decreased"
      price_change = "Indeterminate"
    elif supply_shift == "Left" and demand_shift == "Unchanged":
      quantity_change = "Decreased"
      price_change = "Increased"
    elif supply_shift == "Left" and demand_shift == "Right":
      quantity_change = "Indeterminate"
      price_change = "Increased"
    elif supply_shift == "Unchanged" and demand_shift == "Left":
      quantity_change = "Decreased"
      price_change = "Decreased"
    elif supply_shift == "Unchanged" and demand_shift == "Unchanged":
      quantity_change = "Indeterminate"
      price_change = "Indeterminate"
    elif supply_shift == "Unchanged" and demand_shift == "Right":
      quantity_change = "Increased"
      price_change = "Increased"
    elif supply_shift == "Right" and demand_shift == "Left":
      quantity_change = "Indeterminate"
      price_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Unchanged":
      quantity_change = "Increased"
      price_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Right":
      quantity_change = "Increased"
      price_change = "Indeterminate"
    ret_value.extend([supply_shift, demand_shift, quantity_change, price_change])
    ax.legend()

  # Perfect Competition
  elif name == "Perfect Competition":
    fig, ax = plt.subplots(1, 2)
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax[0].set_xlabel(x_label)
    ax[0].set_ylabel(y_label)
    ax[0].set_title("Market"), ax[1].set_title("Firm")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")
    supply_shifter = data.get("supplyShifter")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")
    demand_shifter = data.get("demandShifter")

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    ax[0].plot(supply_x, supply_y, label="S")
    ax[0].plot(demand_x, demand_y, label="D")

    supply_left_shifts = ["increasedPricesOfResourcesOrInputs", "taxes", "decreasedCompetition"]
    supply_right_shifts = ["decreasedPricesOfResourcesOrInputs", "subsidies", "increasedCompetition"]

    demand_left_shifts = ["decreasedMarketSize", "decreasedPriceOfASubstitute", "increasedPriceOfAComplement"]
    demand_right_shifts = ["increasedMarketSize", "increasedPriceOfASubstitute", "decreasedPriceOfAComplement"]

    supply_shift = demand_shift = "Unchanged"

    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, price_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]

    if determinant == 0:
      ret_value.extend([None, None])
    else:
      ret_value.extend([round(quantity_equilibrium, 2), round(price_equilibrium, 2)])
    
    if supply_shifter in supply_left_shifts:
      delta_x = supply_x_2 - supply_x_1
      supply_x_1 -= delta_x / 4
      supply_x_2 -= delta_x / 4
      shifted_supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
      ax[0].plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Left"
    elif supply_shifter in supply_right_shifts:
      delta_x = supply_x_2 - supply_x_1
      supply_x_1 += delta_x / 4
      supply_x_2 += delta_x / 4
      shifted_supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
      ax[0].plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Right"
    if demand_shifter in demand_left_shifts:
      delta_x = demand_x_2 - demand_x_1
      demand_x_1 -= delta_x / 4
      demand_x_2 -= delta_x / 4
      shifted_demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
      ax[0].plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Left"
    elif demand_shifter in demand_right_shifts:
      delta_x = demand_x_2 - demand_x_1
      demand_x_1 += delta_x / 4
      demand_x_2 += delta_x / 4
      shifted_demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
      ax[0].plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Right"

    quantity_change = price_change = "None"
    
    if supply_shift == "Left" and demand_shift == "Left":
      quantity_change = "Decreased"
      price_change = "Indeterminate"
    elif supply_shift == "Left" and demand_shift == "Unchanged":
      quantity_change = "Decreased"
      price_change = "Increased"
    elif supply_shift == "Left" and demand_shift == "Right":
      quantity_change = "Indeterminate"
      price_change = "Increased"
    elif supply_shift == "Unchanged" and demand_shift == "Left":
      quantity_change = "Decreased"
      price_change = "Decreased"
    elif supply_shift == "Unchanged" and demand_shift == "Unchanged":
      quantity_change = "Indeterminate"
      price_change = "Indeterminate"
    elif supply_shift == "Unchanged" and demand_shift == "Right":
      quantity_change = "Increased"
      price_change = "Increased"
    elif supply_shift == "Right" and demand_shift == "Left":
      quantity_change = "Indeterminate"
      price_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Unchanged":
      quantity_change = "Increased"
      price_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Right":
      quantity_change = "Increased"
      price_change = "Indeterminate"
    
    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, price_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]
    
    price_list = [price_equilibrium] * len(supply_x)
    min_x = min(supply_x_1, supply_x_2, demand_x_1, demand_x_2)
    max_x = max(supply_x_1, supply_x_2, demand_x_1, demand_x_2)
    x_range = np.linspace(min_x, max_x, num=5)
  
    ax[0].plot(x_range, price_list, label="P")
    ax[1].plot(x_range, price_list, label="D")

    x_limits = ax[0].get_xlim()
    y_limits = ax[0].get_ylim()

    ax[1].set_xlim(x_limits)
    ax[1].set_ylim(y_limits)

    mc_h, mc_k = quantity_equilibrium / 2, price_equilibrium / 2

    mc_a = (price_equilibrium - mc_k) / (quantity_equilibrium - mc_h) ** 2

    mc_x_values = list(np.linspace(min(supply_x_1, supply_x_2, demand_x_1, demand_x_2), max(supply_x_1, supply_x_2, demand_x_1, demand_x_2), 400))
    mc_x_values = np.append(mc_x_values, mc_h)
    mc_x_values.sort()
    mc_y_values = list(map(lambda x: mc_a * (x - mc_h) ** 2 + mc_k, mc_x_values))

    mc_vertex_index = np.where(mc_x_values == mc_h)[0][0]

    mc_x_values = mc_x_values[mc_vertex_index - 50:]
    mc_y_values = mc_y_values[mc_vertex_index - 50:]

    ax[1].plot(mc_x_values, mc_y_values, label="MC")

    atc_h, atc_k = quantity_equilibrium, data.get("averageTotalCostPrice")
    atc_a = (max(supply_y_2, demand_y_2) - min(supply_y_1, demand_y_1)) / (max(supply_x_2, demand_x_2) - min(supply_x_1, demand_x_1))

    atc_x_values = list(np.linspace(min(supply_x_1, supply_x_2, demand_x_1, demand_x_2), max(supply_x_1, supply_x_2, demand_x_1, demand_x_2), 400))
    atc_y_values = list(map(lambda x: atc_a * (x - atc_h) ** 2 + atc_k, atc_x_values))

    ax[1].plot(atc_x_values, atc_y_values, label="ATC")

    profit = "Zero"

    if price_equilibrium > atc_k:
      profit = "Positive"
    elif price_equilibrium < atc_k:
      profit = "Negative"
    
    amount = round(price_equilibrium - atc_k, 2)

    ret_value.extend([supply_shift, demand_shift, quantity_change, price_change, profit, amount])   
    ax[0].legend(), ax[1].legend()

  # Monopoly
  elif name == "Monopoly":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)

    demand_x_intercept = data.get("demandXIntercept")
    mr_x_intercept = data.get("marginalRevenueXIntercept")
    y_intercept = data.get("yIntercept")

    demand_x = [0, demand_x_intercept]
    demand_y = [y_intercept, 0]

    mr_x = [0, mr_x_intercept]
    mr_y = [y_intercept, 0]

    ax.plot(demand_x, demand_y, label="D")
    ax.plot(mr_x, mr_y, label="MR")

    mr_m = (0 - y_intercept) / (mr_x_intercept)
    mr_b = y_intercept
    
    mc_h = mr_x_intercept / 2
    mc_k = (mr_m * mc_h + mr_b) / 2

    profit_maximizing_quantity = round(mr_x_intercept * 0.71, 2)

    mc_a = ((mr_m * profit_maximizing_quantity + mr_b) - mc_k) / (profit_maximizing_quantity - mc_h) ** 2

    mc_x_values = list(np.linspace(0, (demand_x_intercept + mr_x_intercept) / 2, 400))
    mc_x_values = np.append(mc_x_values, mc_h)
    mc_x_values.sort()
    mc_y_values = list(map(lambda x: mc_a * (x - mc_h) ** 2 + mc_k, mc_x_values))

    mc_vertex_index = np.where(mc_x_values == mc_h)[0][0]

    mc_x_values = mc_x_values[mc_vertex_index - 50:]
    mc_y_values = mc_y_values[mc_vertex_index - 50:]

    ax.plot(mc_x_values, mc_y_values, label="MC")

    demand_m = (0 - y_intercept) / (demand_x_intercept)
    demand_b = y_intercept
    profit_maximizing_price = round(demand_m * profit_maximizing_quantity + demand_b, 2)

    elastic_region = f"(0, {mr_x_intercept})"
    unit_elastic_point = mr_x_intercept
    inelastic_region = f"({mr_x_intercept}, {demand_x_intercept})"

    atc_h, atc_k = profit_maximizing_quantity, data.get("averageTotalCostPrice")
    atc_a = y_intercept / (max(demand_x_intercept, mr_x_intercept) - min(demand_x_intercept, mr_x_intercept)) / 10

    atc_x_values = list(np.linspace(0, max(demand_x_intercept, mr_x_intercept), 400))
    atc_y_values = list(map(lambda x: atc_a * (x - atc_h) ** 2 + atc_k, atc_x_values))

    atc_x_values = atc_x_values[25:275]
    atc_y_values = atc_y_values[25:275]

    ax.plot(atc_x_values, atc_y_values, label="ATC")

    profit = "Zero"

    if profit_maximizing_price > atc_k:
      profit = "Positive"
    elif profit_maximizing_price < atc_k:
      profit = "Negative"
    
    amount = round(profit_maximizing_price - atc_k, 2)

    ret_value.extend([profit_maximizing_quantity, profit_maximizing_price, elastic_region, unit_elastic_point, inelastic_region, profit, amount])

    ax.legend()
  
  # Perfectly Competitive Factor Market
  elif name == "Perfectly Competitive Factor Market":
    fig, ax = plt.subplots(1, 2)
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax[0].set_xlabel(x_label)
    ax[0].set_ylabel(y_label)
    ax[0].set_title("Market"), ax[1].set_title("Firm")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")
    supply_shifter = data.get("supplyShifter")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")
    demand_shifter = data.get("demandShifter")

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    ax[0].plot(supply_x, supply_y, label="S")
    ax[0].plot(demand_x, demand_y, label="D")

    ax[1].plot(demand_x, demand_y, label="D = MRP")

    supply_shift = demand_shift = "Unchanged"

    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, wage_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]

    if determinant == 0:
      ret_value.extend([None, None])
    else:
      ret_value.extend([round(quantity_equilibrium, 2), round(wage_equilibrium, 2)])
    
    if supply_shifter == "decreaseInSupply":
      delta_x = supply_x_2 - supply_x_1
      supply_x_1 -= delta_x / 4
      supply_x_2 -= delta_x / 4
      shifted_supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
      ax[0].plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Left"
    elif supply_shifter == "increaseInSupply":
      delta_x = supply_x_2 - supply_x_1
      supply_x_1 += delta_x / 4
      supply_x_2 += delta_x / 4
      shifted_supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
      ax[0].plot(shifted_supply_x , supply_y, label="S1")
      supply_shift = "Right"
    if demand_shifter == "decreaseInDemand":
      delta_x = demand_x_2 - demand_x_1
      demand_x_1 -= delta_x / 4
      demand_x_2 -= delta_x / 4
      shifted_demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
      ax[0].plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Left"
    elif demand_shifter == "increaseInDemand":
      delta_x = demand_x_2 - demand_x_1
      demand_x_1 += delta_x / 4
      demand_x_2 += delta_x / 4
      shifted_demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
      ax[0].plot(shifted_demand_x , demand_y, label="D1")
      demand_shift = "Right"

    quantity_change = wage_change = "None"
    
    if supply_shift == "Left" and demand_shift == "Left":
      quantity_change = "Decreased"
      wage_change = "Indeterminate"
    elif supply_shift == "Left" and demand_shift == "Unchanged":
      quantity_change = "Decreased"
      wage_change = "Increased"
    elif supply_shift == "Left" and demand_shift == "Right":
      quantity_change = "Indeterminate"
      wage_change = "Increased"
    elif supply_shift == "Unchanged" and demand_shift == "Left":
      quantity_change = "Decreased"
      wage_change = "Decreased"
    elif supply_shift == "Unchanged" and demand_shift == "Unchanged":
      quantity_change = "Indeterminate"
      wage_change = "Indeterminate"
    elif supply_shift == "Unchanged" and demand_shift == "Right":
      quantity_change = "Increased"
      wage_change = "Increased"
    elif supply_shift == "Right" and demand_shift == "Left":
      quantity_change = "Indeterminate"
      wage_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Unchanged":
      quantity_change = "Increased"
      wage_change = "Decreased"
    elif supply_shift == "Right" and demand_shift == "Right":
      quantity_change = "Increased"
      wage_change = "Indeterminate"
    
    supply_line, demand_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    determinant, quantity_equilibrium, wage_equilibrium = equilibrium_dict["determinant"], equilibrium_dict["x"], equilibrium_dict["y"]
    
    wage_list = [wage_equilibrium] * len(supply_x)
    min_x = min(supply_x_1, supply_x_2, demand_x_1, demand_x_2)
    max_x = max(supply_x_1, supply_x_2, demand_x_1, demand_x_2)
    x_range = np.linspace(min_x, max_x, num=5)
  
    ax[0].plot(x_range, wage_list, label="W")
    ax[1].plot(x_range, wage_list, label="S = MRC")

    x_limits = ax[0].get_xlim()
    y_limits = ax[0].get_ylim()

    ax[1].set_xlim(x_limits)
    ax[1].set_ylim(y_limits)

    ret_value.extend([supply_shift, demand_shift, quantity_change, wage_change])   
    ax[0].legend(), ax[1].legend()

  elif name == "Monopsony":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)

    y_intercept = data.get("yIntercept")

    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")

    mrc_x_2 = data.get("marginalResourceCostX2")
    mrc_y_2 = data.get("marginalResourceCostY2")

    demand_x_intercept = data.get("demandXIntercept")
    demand_y_intercept = data.get("demandYIntercept")

    supply_x = [0, supply_x_2]
    supply_y = [y_intercept, supply_x_2]

    mrc_x = [0, mrc_x_2]
    mrc_y = [y_intercept, mrc_y_2]

    demand_x = [0, demand_x_intercept]
    demand_y = [demand_y_intercept, 0]

    ax.plot(supply_x, supply_y, label="S")
    ax.plot(mrc_x, mrc_y, label="MRC")
    ax.plot(demand_x, demand_y, label="D = MRP")

    mrc_line, demand_line = Line(0, y_intercept, mrc_x_2, mrc_y_2), Line(0, demand_y_intercept, demand_x_intercept, 0)
    intersection_dict = intersection(mrc_line, demand_line)
    quantity, wage_intersection = round(intersection_dict["x"], 2), intersection_dict["y"]

    supply_m = (supply_y_2 - y_intercept) / supply_x_2
    supply_b = y_intercept
    wage = round(supply_m * quantity + supply_b, 2)

    supply_line = Line(0, y_intercept, supply_x_2, supply_y_2)
    equilibrium_dict = intersection(supply_line, demand_line)
    quantity_equilibrium, wage_equilibrium = equilibrium_dict["x"], equilibrium_dict["y"]

    deadweight_loss = round((quantity_equilibrium - quantity) * (wage_intersection - wage) / 2, 2)

    ret_value.extend([quantity, wage, deadweight_loss])
    ax.legend()

  # Negative Externality
  elif name == "Negative Externality":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    ax.set_title("Negative Externality")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")

    msc_x_1 = data.get("marginalSocialCostX1")
    msc_y_1 = data.get("marginalSocialCostY1")
    msc_x_2 = data.get("marginalSocialCostX2")
    msc_y_2 = data.get("marginalSocialCostY2")

    supply_line, demand_line, msc_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2), Line(msc_x_1, msc_y_1, msc_x_2, msc_y_2)
    free_market_dict = intersection(supply_line, demand_line)
    socially_optimal_dict = intersection(msc_line, demand_line)

    quantity_fm, price_fm = free_market_dict["x"], free_market_dict["y"]
    quantity_so, price_so = socially_optimal_dict["x"], socially_optimal_dict["y"]

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    msc_x = np.linspace(msc_x_1, msc_x_2, num=5)
    msc_y = np.linspace(msc_y_1, msc_y_2, num=5)

    ax.plot(supply_x, supply_y, label="S")
    ax.plot(demand_x, demand_y, label="D")
    ax.plot(msc_x, msc_y, label="MSC")

    deadweight_loss = round((quantity_fm - quantity_so) * (price_so - price_fm) / 2, 2)

    ret_value.extend([quantity_fm, price_fm, quantity_so, price_so, deadweight_loss])

    ax.legend()

  # Positive Externality
  elif name == "Positive Externality":
    fig, ax = plt.subplots()
    x_label = data.get("xLabel")
    y_label = data.get("yLabel")
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    ax.set_title("Positive Externality")

    supply_x_1 = data.get("supplyX1")
    supply_y_1 = data.get("supplyY1")
    supply_x_2 = data.get("supplyX2")
    supply_y_2 = data.get("supplyY2")

    demand_x_1 = data.get("demandX1")
    demand_y_1 = data.get("demandY1")
    demand_x_2 = data.get("demandX2")
    demand_y_2 = data.get("demandY2")

    msb_x_1 = data.get("marginalSocialBenefitX1")
    msb_y_1 = data.get("marginalSocialBenefitY1")
    msb_x_2 = data.get("marginalSocialBenefitX2")
    msb_y_2 = data.get("marginalSocialBenefitY2")

    supply_line, demand_line, msb_line = Line(supply_x_1, supply_y_1, supply_x_2, supply_y_2), Line(demand_x_1, demand_y_1, demand_x_2, demand_y_2), Line(msb_x_1, msb_y_1, msb_x_2, msb_y_2)
    free_market_dict = intersection(supply_line, demand_line)
    socially_optimal_dict = intersection(msb_line, supply_line)

    quantity_fm, price_fm = free_market_dict["x"], free_market_dict["y"]
    quantity_so, price_so = socially_optimal_dict["x"], socially_optimal_dict["y"]

    supply_x = np.linspace(supply_x_1, supply_x_2, num=5)
    supply_y = np.linspace(supply_y_1, supply_y_2, num=5)

    demand_x = np.linspace(demand_x_1, demand_x_2, num=5)
    demand_y = np.linspace(demand_y_1, demand_y_2, num=5)

    msb_x = np.linspace(msb_x_1, msb_x_2, num=5)
    msb_y = np.linspace(msb_y_1, msb_y_2, num=5)

    ax.plot(supply_x, supply_y, label="S")
    ax.plot(demand_x, demand_y, label="D")
    ax.plot(msb_x, msb_y, label="MSB")

    deadweight_loss = round((quantity_so - quantity_fm) * (price_so - price_fm) / 2, 2)

    ret_value.extend([quantity_fm, price_fm, quantity_so, price_so, deadweight_loss])

    ax.legend()

  buf = BytesIO()
  fig.savefig(buf, format="png")
  ret_value.append(base64.b64encode(buf.getbuffer()).decode("ascii"))
  return ret_value