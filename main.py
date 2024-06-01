from flask import Flask, request, jsonify
from flask_cors import CORS

from controller import get_data

app = Flask(__name__)
CORS(app)

def convert_data(data):
  return {key: float(value) if value.replace('.', '', 1).isdigit() else value for key, value in data.items()}

@app.route("/")
def test():
    return "<h1>Test</h1>"

# PPF
@app.route("/api/ppf/bowed", methods=["GET", "POST"])
def get_bowed():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"graph": res[0]})

@app.route("/api/ppf/linear", methods=["GET", "POST"])
def get_linear():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"xLabel": res[0], "yLabel": res[1], "goodXOpportunityCost": res[2], "goodYOpportunityCost": res[3], "graph": res[4]})

# Supply and Demand
@app.route("/api/supply_and_demand/price_controls", methods=["GET", "POST"])
def get_price_controls():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityEquilibrium": res[0], "priceEquilibrium": res[1], "type": res[2], "quantity": res[3], "graph": res[4]})

@app.route("/api/supply_and_demand/shifts", methods=["GET", "POST"])
def get_shifts():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityEquilibrium": res[0], "priceEquilibrium": res[1], "supplyShift": res[2], "demandShift": res[3], "quantityChange": res[4], "priceChange": res[5], "graph": res[6]})

# Perfect Competition
@app.route("/api/perfect_competition", methods=["GET", "POST"])
def get_perfect_competition():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityEquilibrium": res[0], "priceEquilibrium": res[1], "supplyShift": res[2], "demandShift": res[3], "quantityChange": res[4], "priceChange": res[5], "profit": res[6], "amount": res[7], "graph": res[8]})

# Monopoly
@app.route("/api/monopoly", methods=["GET", "POST"])
def get_monopoly():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantity": res[0], "price": res[1], "elasticRegion": res[2], "unitElasticPoint": res[3], "inelasticRegion": res[4], "profit": res[5], "amount": res[6], "graph": res[7]})

# Factor Markets
@app.route("/api/factor_markets/perfect_competition", methods=["GET", "POST"])
def get_perfectly_competitive_factor_markets():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityEquilibrium": res[0], "wageEquilibrium": res[1], "supplyShift": res[2], "demandShift": res[3], "quantityChange": res[4], "wageChange": res[5], "graph": res[6]})

@app.route("/api/factor_markets/monopsony", methods=["GET", "POST"])
def get_monopsony():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantity": res[0], "wage": res[1], "deadweightLoss": res[2], "graph": res[3]})

# Externalities
@app.route("/api/externalities/negative_externality", methods=["GET", "POST"])
def get_negative_externality():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityFreeMarket": res[0], "priceFreeMarket": res[1], "quantitySociallyOptimal": res[2], "priceSociallyOptimal": res[3], "deadweightLoss": res[4], "graph": res[5]})

@app.route("/api/externalities/positive_externality", methods=["GET", "POST"])
def get_positive_externality():
  data = convert_data(request.form)
  res = get_data(data)
  return jsonify({"quantityFreeMarket": res[0], "priceFreeMarket": res[1], "quantitySociallyOptimal": res[2], "priceSociallyOptimal": res[3], "deadweightLoss": res[4], "graph": res[5]})

if __name__ == "__main__":
    app.run(debug=True)